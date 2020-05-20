pragma solidity ^0.6.1;
import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./contractFacades/ERC20Like.sol";
import "./Behodler.sol";
import "./contractFacades/WethLike.sol";
/*
	Janus will be used by the front end to execute a token to token swap without requiring the user know about scarcity.
	If trading pair involves scarcity then only one arm of the Behodler need be invoked.
	If either of the token is Eth, Janus first wraps (or unwraps) it before swapping the weth. Behodler doesn't deal in Eth.
	Developers building on top of Behodler trading functionality should treat Janus as their portal.
 */

contract Janus is Secondary{
	Behodler public behodler;
	address public scarcityAddress;
	WethLike public weth;
	using SafeMath for uint;
	address self;

	constructor () public {
		self = address(this);
	}

	receive() payable external {
    }

	function seed (address scx, address wet, address beh) external onlyPrimary {
		weth = WethLike(wet);
		scarcityAddress = scx;
		behodler = Behodler(beh);
	}

	//user must authorize behodler to take input token
	function tokenToToken(address input, address output, uint value, uint minPrice, uint maxPrice) external returns (uint bought) {
		return tokenToToken(msg.sender,input,output,value,minPrice,maxPrice);
	}

	function tokenToToken(address sender, address input, address output, uint value, uint minPrice, uint maxPrice) private returns (uint bought) {
	require(input!=output,"input token must be different to output token");
		if(input == scarcityAddress){
			bought = behodler.sellScarcityDelegate(sender, output, value,maxPrice);
		}else if (output == scarcityAddress){
			bought = behodler.buyScarcityDelegate(sender, input, value,minPrice);
		}else {
			uint scx = behodler.buyScarcityDelegate(sender, input, value,minPrice);
			uint max = behodler.tokenScarcityObligations(output);
			uint scxToSend = scx>max?max:scx;
			bought = behodler.sellScarcityDelegate(sender, output, scxToSend,maxPrice);
		}
	}

	function ethToToken(address output, uint minPrice, uint maxPrice) external payable returns (uint bought) { // user needs to enable eth for behodler
		require(msg.value>0, "no eth sent");
		weth.deposit.value(msg.value)();
		weth.transfer(msg.sender,msg.value);
		bought = tokenToToken(msg.sender,address(weth),output,msg.value,minPrice,maxPrice);
	}

	function tokenToEth(address input, uint value, uint minPrice, uint maxPrice) external returns (uint bought) {//user must authorize weth for Janus
		bought = tokenToToken(msg.sender, input, address(weth),value,minPrice,maxPrice);
		weth.transferFrom(msg.sender,self,bought);
		weth.withdraw(bought);
		(bool success, ) = msg.sender.call.value(bought)("");
		require(success, "Transfer failed.");
	}
}