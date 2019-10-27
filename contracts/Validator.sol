pragma solidity  0.5;
import "./baseContracts/IValidator.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";

contract Validator is IValidator, Secondary
{
	address weiDaiAddress;
	address daiAddress;
	address scarcityAddress;
	address wethAddress;
	mapping (address=>bool) validTokens;
	mapping (address=>bool) burnableTokens;
	mapping(address=>bool) bootstrapped; //tokens need to be bootstrapped before being traded.

	function setScarcityAddress(address scx) public onlyPrimary{
		scarcityAddress = scx;
	}

	function getScarcityAddress () external view returns (address) {
		return scarcityAddress;
	}

	function getWethAddress() external view returns (address){
		return wethAddress;
	}

	function setValidAddresses(address weidai, address dai, address weth, bool valid) public onlyPrimary {
		validTokens[weidai] = valid;
		validTokens[dai] = valid;
		validTokens[weth] = valid;
		burnableTokens[weidai] = valid;
		wethAddress = weth;
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