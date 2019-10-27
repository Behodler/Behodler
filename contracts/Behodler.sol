pragma solidity  0.5;
import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./baseContracts/IValidator.sol";
import "./baseContracts/Burnable.sol";
import "./MockWeth.sol";
import "./libraries/SafeOperations.sol";
//TODO import version controller solidity

contract Behodler is Secondary
{
	using SafeMath for uint;
	uint constant factor = 128;
	using SafeOperations for uint;

	address versionControllerAddress;
	address validatorAddress;
	mapping (address=>uint) tokenScarcityObligations;

	function setVersionController(address vcAddress) public onlyPrimary{
		versionControllerAddress = vcAddress;
	}

	function setValidatorAddress(address valAddress) public onlyPrimary {
		validatorAddress = valAddress;
	}

	function buyWithEth(address tokenAddress) public payable returns (bool){
		address weth = IValidator(validatorAddress).getWethAddress();
		MockWeth(weth).deposit.value(msg.value)();
		buy(tokenAddress,msg.value,msg.sender);
	}

	function sellForEth(address tokenAddress, uint value) public returns (bool){
		address weth = IValidator(validatorAddress).getWethAddress();
		MockWeth(weth).withdraw(value);
		sell(tokenAddress,value,msg.sender);
	}

	function tradeTokens(address tokenIn, address tokenOut, uint tokenInValue) public{
		return trade(msg.sender,tokenIn,tokenOut,tokenInValue);
	}

	function trade(address trader, address tokenIn, address tokenOut, uint tokenInValue) private returns (bool){
		address scarcityAddress = IValidator(validatorAddress).getScarcityAddress();
		uint balanceBefore = ERC20(scarcityAddress).balanceOf(trader);
		buy(tokenIn,tokenInValue,trader);
		uint scarcityToSpend = ERC20(scarcityAddress).balanceOf(trader) - balanceBefore;
		sell(tokenOut,scarcityToSpend,trader);
		return true;
	}

	function buyScarcity(address tokenAddress, uint value) public returns (bool){
		return buy(tokenAddress,value,msg.sender);
	}

	function sellScarcity(address tokenAddress, uint value) public returns (bool){
		return sell(tokenAddress,value,msg.sender);
	}

	function buy (address tokenAddress, uint value, address purchaser) private returns (bool){
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
		require(scarcityToPrint > 0, "No scarcity generated.");

		//bookkeeping
		tokenScarcityObligations[tokenAddress] = finalScarcity;
		//issue scarcity, take tokens
		Scarcity(scarcityAddress).issue(msg.sender, scarcityToPrint);
	}

	function sell (address tokenAddress, uint scarcityValue, address seller) private returns (bool){
		require(IValidator(validatorAddress).TokenValid(tokenAddress), "token not tradeable.");
		ERC20(IValidator(validatorAddress).getScarcityAddress()).transferFrom(seller,address(this),value);

		uint currentObligation = tokenScarcityObligations[tokenContract];

		uint scarcityToSpend = scarcityValue.mul(100-ScarcityBurnFeePercentage(tokeAddress)).div(10000);
		require(scarcityToSpend <= currentObligation,"Scarcity exceeds token reserves");
		Burnable(scarcityAddress).burn(seller,scarcityValue);

		uint scarcityAfter = currentObligation.sub(scarcityToSpend);
		uint tokenObligations = currentObligation.square().safeRightShift(factor);
		uint tokensAfter = scarcityAfter.square().safeRightShift(factor);

		uint tokensToSendToUser = (tokenObligations.sub(tokensAfter));//no spread

		require(tokensToSendToUser > 0, "No tokens released.");

		tokenScarcityObligations[tokenContract] = scarcityAfter;
		ERC20(tokenContract).transfer(seller,tokensToSendToUser);
		return true;
	}


	function ScarcityBurnFeePercentage(address tokenAddress) public returns (uint){//per between 1 and 10 that shrink as scarcity grows
		uint currentObligation = tokenScarcityObligations[tokenContract];
		uint upperLimit = (1 finney).safeLeftShift(factor);
		if(currentObligtion >= upperLimit){
			return 0;
		}

		uint fee = (upperLimit - currentObligation).mul(1000).div(upperLimit);
		return fee;
	}
}