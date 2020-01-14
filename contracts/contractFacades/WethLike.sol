pragma solidity 0.5;
import "./ERC20Like.sol";

contract WethLike is ERC20Like
{
	function deposit () public payable;
	function withdraw(uint value) public;
}