pragma solidity ^0.6.1;

import "./hephaestus/Bellows.sol";
import "./contractFacades//PatienceRegulationEngineLike.sol";
import "./contractFacades/WeiDaiBankLike.sol";
import "./Behodler.sol";
import "./Prometheus.sol";
import "./contractFacades/PyroTokenLike.sol";
import "./hephaestus/PyroTokenRegistry.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "./contractFacades/ERC20Like.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Scarcity.sol";
import "./contractFacades/WeiDaiLike.sol";
/*
	Kharon exacts fees from input tokens in a behodler trade. If the input token is a pyrotoken, the fee is used to increase the reserve.
	If the token is dai, it is used to instantly buy and burn WeiDai. If the token is WeiDai or Scarcity, it is burnt. Burning scarcity helps to gradually
	increase the liquidity pool of the output token.
	Kharon has logic for knowing when to stop burning scarcity (too much liquidity)
	It also has logic for knowing when to not charge a fee. For instance, the user could have an NFT that exempts fees. This can be an external dependency.
	Before burning, Kharon asks Prometheus how much 'he' wants.
 */

contract Kharon is Secondary{
	using SafeMath for uint;
	Bellows public bellows;
	Behodler public behodler;
	Prometheus public prometheus;
	PatienceRegulationEngineLike public PatienceRegulationEngine;
	PyroTokenRegistry public tokenRegistry;
	address public WeiDaiBank;
	address public Dai;
	address public scarcityAddress;
	address weidaiAddress;
	address donationAddress;
	uint scarcityBurnCuttoff;

	function seed (address bl, address bh, address pm, address pr, address ban,address dai, address weidai, address scar, uint cut, address d) external onlyPrimary {
		bellows = Bellows(bl);
		behodler = Behodler(bh);
		prometheus = Prometheus(pm);
		tokenRegistry = prometheus.tokenRegistry();
		PatienceRegulationEngine = PatienceRegulationEngineLike(pr);
		WeiDaiBank = ban;
		Dai = dai;
		scarcityAddress = scar;
		scarcityBurnCuttoff = cut;
		donationAddress = d;
		weidaiAddress = weidai;
	}

	function toll(address token, uint value) public view returns (uint){//percentage expressed as number between 0 and 1000
		//if the token isn't scarcity, we burn 2.4%. If it is scarcity, we first check if we should burn anymore
		if(token != scarcityAddress || behodler.tokenScarcityObligations(token) <= scarcityBurnCuttoff){
			return uint(24).mul(value).div(1000);
		}
		return 0;
	}

	function demandPayment (address token, uint value, address buyer) external returns (uint) {
		require(msg.sender == address(behodler), "only Behodler can invoke this function");
		uint tollValue = toll(token,value);
		if(tollValue == 0)
			return 0;

		require(ERC20Like(token).transferFrom(msg.sender, address(this), tollValue),"toll taking failed");
		ERC20Like(token).approve(address(prometheus),uint(-1));
		uint reward = prometheus.stealFlame(token,tollValue, buyer);
		uint netToll = tollValue.sub(reward);
		//get split rate and calculate portion to burn. Remaining is a donation
		uint donationSplit = PatienceRegulationEngine.getDonationSplit(buyer);
		uint netSplitRate = uint(100).sub(donationSplit);
		uint amountToBurn = netToll.mul(100).div(netSplitRate);

		if(token == Dai){
			ERC20Like(token).approve(WeiDaiBank,uint(-1));
			PatienceRegulationEngine.buyWeiDai(netToll,donationSplit);
			PatienceRegulationEngine.claimWeiDai();
		}else if(token == scarcityAddress) {
			Scarcity(token).burn(netToll);
		}else if(token == weidaiAddress){
			uint thisDonationSplit = PatienceRegulationEngine.getDonationSplit(address(this));
			PatienceRegulationEngine.setDonationSplit(donationSplit);
			WeiDaiLike(token).burn(address(this), netToll);
			PatienceRegulationEngine.setDonationSplit(thisDonationSplit);
		}
		 else if(tokenRegistry.baseTokenMapping(token) != address(0)){
			bellows.open(token,amountToBurn);
		}
		else {
			revert("invalid token trade.");
		}
		return tollValue;
	}

	function withdrawDonations(address token) external onlyPrimary{
		require(donationAddress != address(0),"donation address not set");
		uint balance = ERC20Like(token).balanceOf(address(this));
		if(balance>0)
			ERC20Like(token).transfer(donationAddress,balance);
	}
}