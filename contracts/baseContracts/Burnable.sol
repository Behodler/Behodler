pragma solidity  0.5;

contract Burnable{
	function burn (uint value) external;
	function burn (address holder, uint value) public;
}