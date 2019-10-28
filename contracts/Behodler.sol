pragma solidity  0.5;
import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./baseContracts/IValidator.sol";
import "./baseContracts/Burnable.sol";
import "./Weth.sol";
import "./libraries/SafeOperations.sol";
import "./Scarcity.sol";

contract Behodler is Secondary
{
	using SafeMath for uint;
	uint constant factor = 128;
	using SafeOperations for uint;
	uint upperLimit;
	address validatorAddress;
	mapping (address=>uint) tokenScarcityObligations;

	function getMarginalScarcityPriceOfToken(address tokenAddress) public view returns (uint) {
		return tokenScarcityObligations[tokenAddress];
	}

	function calculateAverageScarcityPerToken(address tokenAddress, uint value) public view  returns (uint) { // S/T
		require (value>0, "Non-zero token value to avoid division by zero.");

		uint amountToPurchaseWith = value;
		if(IValidator(validatorAddress).TokenBurnable(tokenAddress) && !IValidator(validatorAddress).FeeExempt(msg.sender)){
			uint fee = IValidator(validatorAddress).BurnFeePercentage().mul(value)/100;
			amountToPurchaseWith = amountToPurchaseWith.sub(fee);
		}

		uint currentTokens = tokenScarcityObligations[tokenAddress].square().safeRightShift(factor);
		uint finalTokens = currentTokens.add(amountToPurchaseWith);
		uint finalScarcity = (finalTokens.safeLeftShift(factor)).sqrt();
		uint scarcityToPrint = finalScarcity.sub(tokenScarcityObligations[tokenAddress]);
		return scarcityToPrint/amountToPurchaseWith;
	}

	function setFeeUpperLimit(uint limit) public onlyPrimary {
		upperLimit = limit;
	}

	function getScarcityAddress() private view returns (address){
		return IValidator(validatorAddress).getScarcityAddress();
	}

	function setValidatorAddress(address valAddress) public onlyPrimary {
		validatorAddress = valAddress;
	}

	function buyWithEth(address tokenAddress, uint minPrice) public payable returns (bool){
		address weth = IValidator(validatorAddress).getWethAddress();
		Weth(weth).deposit.value(msg.value)();
		buy(tokenAddress,msg.value,msg.sender, minPrice);
	}

	function sellForEth(address tokenAddress, uint value, uint maxPrice) public returns (bool){
		address weth = IValidator(validatorAddress).getWethAddress();
		Weth(weth).withdraw(value);
		sell(tokenAddress,value,msg.sender, maxPrice);
	}

	function tradeTokens(address tokenIn, address tokenOut, uint tokenInValue, uint minPrice, uint maxPrice) public returns (bool){
		return trade(msg.sender,tokenIn,tokenOut,tokenInValue, minPrice, maxPrice);
	}

	function trade(address trader, address tokenIn, address tokenOut, uint tokenInValue, uint minPrice, uint maxPrice) private returns (bool){
		address scarcityAddress = getScarcityAddress();
		uint balanceBefore = ERC20(scarcityAddress).balanceOf(trader);
		buy(tokenIn,tokenInValue,trader, minPrice);
		uint scarcityToSpend = ERC20(scarcityAddress).balanceOf(trader) - balanceBefore;
		sell(tokenOut,scarcityToSpend,trader, maxPrice);
		return true;
	}

	function buyScarcity(address tokenAddress, uint value, uint minPrice) public returns (bool){
		return buy(tokenAddress,value,msg.sender, minPrice);
	}

	function sellScarcity(address tokenAddress, uint value, uint maxPrice) public returns (bool){
		return sell(tokenAddress,value,msg.sender, maxPrice);
	}

	function buy (address tokenAddress, uint value, address purchaser, uint minPrice) private returns (bool){
		require(IValidator(validatorAddress).TokenValid(tokenAddress), "token not tradeable.");
		ERC20(tokenAddress).transferFrom(purchaser,address(this),value);
		uint amountToPurchaseWith = value;
		if(IValidator(validatorAddress).TokenBurnable(tokenAddress) && !IValidator(validatorAddress).FeeExempt(purchaser)){
			uint fee = IValidator(validatorAddress).BurnFeePercentage().mul(value)/100;
			Burnable(tokenAddress).burn(address(this),fee);
			amountToPurchaseWith = amountToPurchaseWith.sub(fee);
		}

		uint currentTokens = tokenScarcityObligations[tokenAddress].square().safeRightShift(factor);
		uint finalTokens = currentTokens.add(amountToPurchaseWith);
		uint finalScarcity = (finalTokens.safeLeftShift(factor)).sqrt();
		uint scarcityToPrint = finalScarcity.sub(tokenScarcityObligations[tokenAddress]);

		require(minPrice > 0 && scarcityToPrint/amountToPurchaseWith >= minPrice, "price slippage exceeded tolerance.");
		require(scarcityToPrint > 0, "No scarcity generated.");

		address scarcityAddress = getScarcityAddress();
		//bookkeeping
		tokenScarcityObligations[tokenAddress] = finalScarcity;
		//issue scarcity, take tokens
		Scarcity(scarcityAddress).mint(msg.sender, scarcityToPrint);
	}

	function sell (address tokenAddress, uint scarcityValue, address seller, uint maxPrice) private returns (bool){
		require(IValidator(validatorAddress).TokenValid(tokenAddress) || msg.sender == primary(), "token not tradeable.");
		ERC20(IValidator(validatorAddress).getScarcityAddress()).transferFrom(seller,address(this), scarcityValue);
		address scarcityAddress = getScarcityAddress();
		uint currentObligation = tokenScarcityObligations[tokenAddress];

		uint scarcityToSpend = scarcityValue.mul(100-ScarcityBurnFeePercentage(tokenAddress)).div(10000);
		require(scarcityToSpend <= currentObligation,"Scarcity exceeds token reserves");
		Scarcity(scarcityAddress).burn(scarcityValue);

		uint scarcityAfter = currentObligation.sub(scarcityToSpend);
		uint tokenObligations = currentObligation.square().safeRightShift(factor);
		uint tokensAfter = scarcityAfter.square().safeRightShift(factor);

		uint tokensToSendToUser = (tokenObligations.sub(tokensAfter));//no spread

		require(tokensToSendToUser > 0, "No tokens released.");
		require(maxPrice > 0 && scarcityToSpend/tokensToSendToUser <= maxPrice, "price slippage exceeded tolerance.");

		tokenScarcityObligations[tokenAddress] = scarcityAfter;
		ERC20(tokenAddress).transfer(seller,tokensToSendToUser);
		return true;
	}


	function ScarcityBurnFeePercentage(address tokenAddress) public view returns (uint){//percentage between 1 and 10 that shrink as scarcity grows
		uint currentObligation = tokenScarcityObligations[tokenAddress];
	
		uint limit = upperLimit > 0 ? upperLimit : ((uint)(1 finney)).safeLeftShift(factor);
		if(currentObligation >= limit){
			return 0;
		}

		uint fee = (limit - currentObligation).mul(1000).div(upperLimit);
		return fee;
	}
}