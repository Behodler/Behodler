pragma solidity 0.5;
/*
PyroTokens wrap tokens traded on Behodler (except for Dai, WeiDai and Scarcity).
PyroTokens are ERC20 tokens that can engulf (wrap) a token. The base token is then added to a Bellow by opening it.
Unwrapping happens at the Bellows as a 'blast'.
*/
contract PyroTokenLike {
	function bellows() public view returns (address);
	function baseToken() public view returns (address);
	function engulf (address sender, uint value) public returns (bool);
	function burn (uint value) public returns (bool);
}