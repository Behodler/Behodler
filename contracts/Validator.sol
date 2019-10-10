pragma solidity  0.5;
import "./baseContracts/IValidator.sol";

contract Validator is IValidator
{
	address weiDaiAddress;
	address daiAddress;
	mapping (address=>bool) validTokens;
	mapping (address=>bool) burnableTokens;
	mapping(address=>bool) bootstrapped; //tokens need to be bootstrapped before being traded.
	
	function setValidAddresses(address weidai, address dai, bool valid) public {
		validTokens[weidai] = valid;
		validTokens[dai] = valid;
		burnableTokens[weidai] = valid;
	}

	function TokenValid (address tokenAddress) external view returns (bool){
		return validTokens[tokenAddress];
	}

	function TokenBurnable(address tokenAddress) external view returns (bool){
		return burnableTokens[tokenAddress];
	}

	function FeeExempt(address seller) external view returns (bool){
		return seller == address(0);
	}

	function BurnFeePercentage() external view returns (uint){
		return 1;
	}

	function BootstrapValue(address tokenAddress) external view returns (uint){
		return validTokens[tokenAddress]? 50 finney:0;
	}

	function ScarcityPublic() external view returns (bool){
		return false;
	}

	function IsBootStrapped(address tokenAddress) external view returns (bool){
		return bootstrapped[tokenAddress];
	}
}