pragma solidity ^0.6.1;
import "./ERC20Like.sol";

abstract contract WethLike is ERC20Like
{
	function deposit () external payable virtual;
	function withdraw(uint value) external virtual;
}