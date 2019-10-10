pragma solidity  0.5;

interface IValidator
{
	function TokenValid(address tokenAddress) external view returns (bool);
	function TokenBurnable(address token) external view returns (bool);
	function FeeExempt(address seller) external view returns (bool);
	function BurnFeePercentage() external view returns (uint);
	function BootstrapValue(address tokenAddress) external view returns (uint);
	function IsBootStrapped(address tokenAddress) external view returns (bool);
	function ScarcityPublic() external view returns (bool);
}