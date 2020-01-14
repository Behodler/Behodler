pragma solidity 0.5;
import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "./Behodler.sol";
/*
	Janus will be used by the front end to execute a token to token swap without requiring the user know about scarcity.
	If trading pair involves scarcity then only one arm of the Behodler need be invoked.
	If either of the token is Eth, Janus first wraps (or unwraps) it before Janusping the weth.
 */

contract Janus is Secondary{
	Behodler public behodler;
	address public scarcityAddress;

	function tokenToToken(address input, address output, uint value, uint minPrice, uint maxPrice) public returns (bool) {
		require(input!=output,"tokens can't trade against themselves");
		if(input == scarcityAddress){
			behodler.sellScarcity(output,value,maxPrice);
		}else if (output == scarcityAddress){
			behodler.buyScarcity(input,value,minPrice);
		}else {
			uint scx = behodler.buyScarcity(input,value,minPrice);
			behodler.sellScarcity(output,scx,maxPrice);
		}
		return true;
	}

	//TODO: eth to token and token to eth
}