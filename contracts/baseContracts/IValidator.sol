pragma solidity  0.5;

interface IValidator
{
	function TokenValid(address tokenAddress) external view returns (bool);
}