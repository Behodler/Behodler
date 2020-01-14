pragma solidity 0.5;
import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "./contractFacades/ERC20Like.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./contractFacades//PyroTokenLike.sol";
import "./hephaestus/PyroTokenRegistry.sol";
/*
	Prometheus takes a portion of the fees from Kharon, wraps as a Pyrotoken and gives it to the user as a reward.
	If the input token is scx, dai or weidai, Prometheus doesn't take any.
	A simple implementation of Prometheus immediately hands over the reward to the user. 
	A more complex version might hold onto rewards for 10 trades or 1 month before handing over. We'll have to see. The benefit of handing over after many trades:
		1. Incentive for user to trade often
		2. Can increase reward over time, rewarding frequent traders.
		3. When reward finally comes through, it looks large
	Downsides:
		1. added complexity
		2. users might get disinterested, waiting for pyrotokens.

	Probably no need to give users the ability to engulf (wrap) tokens into pyrotokens. These tokens are for rewards only.
 */

contract Prometheus is Secondary {
	using SafeMath for uint;
	address public kharonAddress;
	address public scarcity;
	address public weiDai;
	address public dai;
	PyroTokenRegistry public tokenRegistry;

	function seed(address k, address scx, address weidai, address d, address registry) public{
		kharonAddress = k;
		scarcity = scx;
		weiDai = weidai;
		dai = d;
		tokenRegistry = PyroTokenRegistry(registry);
	}

	function stealFlame(address token, uint kharonToll, address buyer) public returns (uint){//takes from behodler and returns amountTakenNum
		require(msg.sender == kharonAddress,"only Kharon can invoke this function");
		if(token == scarcity || token == weiDai || token == dai)
			return 0;
		uint gift = kharonToll.div(2);
		require(ERC20Like(token).transferFrom(kharonAddress,address(this),gift),"prometheus flame theft failed.");

		//gifting logic
		PyroTokenLike pyroToken = PyroTokenLike(tokenRegistry.baseTokenMapping(token));
		pyroToken.engulf(buyer, gift);
		return gift;
	}
}