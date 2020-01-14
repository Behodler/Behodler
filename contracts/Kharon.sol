pragma solidity 0.5;
import "./hephaestus/Bellows.sol";
import "./contractFacades//PatienceRegulationEngineLike.sol";
import "./contractFacades/WeiDaiBankLike.sol";
import "./Behodler.sol";
import "./Prometheus.sol";
import "./contractFacades/PyroTokenLike.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "./contractFacades/ERC20Like.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
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
	PatienceRegulationEngineLike PatienceRegulationEngine;
	address WeiDaiBank;
	address Dai;
	address Scarcity;
	uint scarcityBurnCuttoff;

	function seed (address bl, address bh, address pm, address pre, address bank,address dai, address scarcity, uint cutoff) public onlyPrimary {
		bellows = Bellows(bl);
		behodler = Behodler(bh);
		prometheus = Prometheus(pm);
		PatienceRegulationEngine = PatienceRegulationEngineLike(pre);
		WeiDaiBank = bank;
		Dai = dai;
		Scarcity = scarcity;
		scarcityBurnCuttoff = cutoff;
	}

	function toll(address token, uint value) public view returns (uint){//percentage expressed as number between 0 and 1000
		if(token != Scarcity || behodler.tokenScarcityObligations(token)<=scarcityBurnCuttoff){
			return uint(24).mul(value).div(1000);
		}
	}

	function demandPayment (address token, uint value, address buyer) public returns (uint) {
		require(msg.sender == address(behodler), "only Behodler can invoke this function");
		uint tollValue = toll(token,value);
		require(ERC20Like(token).transferFrom(msg.sender,address(this), tollValue),"toll taking failed");
		uint reward = prometheus.stealFlame(token,tollValue, buyer);
		uint amountToBurn = tollValue.sub(reward);
		if(token == Dai){
			PatienceRegulationEngine.buyWeiDai(amountToBurn,PatienceRegulationEngine.getDonationSplit(buyer));
			PatienceRegulationEngine.claimWeiDai();
		}else {
			PyroTokenLike(token).burn(amountToBurn);
		}
		return tollValue;
	}
}