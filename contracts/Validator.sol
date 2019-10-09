pragma solidity  0.5;
import "./baseContracts/IValidator.sol";

contract Validator is IValidator
{
	function TokenValid (address tokenAddress) external view returns (bool){
		return false;
	}
}