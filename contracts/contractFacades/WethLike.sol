pragma solidity ^0.6.1;
import "./ERC20Like.sol";

abstract contract WethLike is ERC20Like
{
	function deposit () public payable virtual;
	function withdraw(uint value) public virtual;
}