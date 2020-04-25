pragma solidity ^0.6.1;
import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./hephaestus/Lachesis.sol";
import "./Kharon.sol";
import "./contractFacades/ERC20Like.sol";
import "./libraries/SafeOperations.sol";
import "./Scarcity.sol";
import "./Chronos.sol";
/*
	Behodler orchestrates trades using an omnischedule bonding curve.
	The name is inspired by the Beholder of D&D, a monster with multiple arms ending in eyes peering in all directions.
	The Behodler is a smart contract that can see the prices of all tokens simultaneously without need for composition or delay.
	The hodl part of Behodler refers to the fact that with every trade of a token pair, the liquidity pool of each token held by Behodler increases
 */
contract Behodler is Secondary
{
	using SafeMath for uint;
	using SafeOperations for uint;
	uint constant factor = 128;
	Lachesis lachesis;
	Kharon kharon;
	Chronos chronos;
	address janus;
	mapping (address=>uint) public tokenScarcityObligations; //marginal scarcity price of token

	function seed(address lachesisAddress, address kharonAddress, address janusAddress, address chronosAddress) external onlyPrimary {
		kharon = Kharon(kharonAddress);
		lachesis = Lachesis(lachesisAddress);
		janus = janusAddress;
		chronos = Chronos(chronosAddress);
	}

	function calculateAverageScarcityPerToken(address tokenAddress, uint value) external view returns (uint avg) { // S/T
		require (value > 0, "Non-zero token value expected to avoid division by zero.");

		uint amountToPurchaseWith = value.sub(kharon.toll(tokenAddress,value));

		uint currentTokens = tokenScarcityObligations[tokenAddress].square().safeRightShift(factor);
		uint finalTokens = currentTokens.add(amountToPurchaseWith);
		uint finalScarcity = (finalTokens.safeLeftShift(factor)).sqrtImprecise();
		uint scarcityToPrint = finalScarcity.sub(tokenScarcityObligations[tokenAddress]);
		avg = scarcityToPrint.div(amountToPurchaseWith);
	}

	function getScarcityAddress() private view returns (address){
		return address(lachesis.scarcity());
	}

	function buyScarcityDelegate(address sender, address tokenAddress, uint value, uint minPrice) external returns (uint){
		require(msg.sender == janus, "External users forbidden from delegating trade.");
		return buy(tokenAddress,value,sender, minPrice);
	}

	function sellScarcityDelegate(address sender, address tokenAddress, uint value, uint maxPrice) external returns (uint){
		require(msg.sender == janus, "External users forbidden from delegating trade.");
		return sell(tokenAddress,value,sender, maxPrice);
	}

	function buyScarcity(address tokenAddress, uint value, uint minPrice) external returns (uint){
		return buy(tokenAddress,value,msg.sender, minPrice);
	}

	function sellScarcity(address tokenAddress, uint value, uint maxPrice) external returns (uint){
		return sell(tokenAddress,value,msg.sender, maxPrice);
	}

	function buy (address tokenAddress, uint value, address purchaser, uint minPrice) private returns (uint){
		lachesis.cut(tokenAddress);
		ERC20Like(tokenAddress).transferFrom(purchaser, address(this),value);
		ERC20Like(tokenAddress).approve(address(kharon),uint(-1));
		uint amountToPurchaseWith = value.sub(kharon.demandPayment(tokenAddress,value,purchaser));

		uint currentTokens = tokenScarcityObligations[tokenAddress].square().safeRightShift(factor);
		uint finalTokens = currentTokens.add(amountToPurchaseWith);
		uint finalScarcity = (finalTokens.safeLeftShift(factor)).sqrtImprecise();
		uint scarcityToPrint = finalScarcity.sub(tokenScarcityObligations[tokenAddress]);

		require(minPrice == 0 || scarcityToPrint >= minPrice.mul(amountToPurchaseWith), "price slippage (min) exceeded tolerance.");
		require(scarcityToPrint > 0, "No scarcity generated.");

		//bookkeeping
		tokenScarcityObligations[tokenAddress] = finalScarcity;
		//issue scarcity
		Scarcity(getScarcityAddress()).mint(purchaser, scarcityToPrint);
		emit scarcityBought(tokenAddress,scarcityToPrint, value);
		return scarcityToPrint;
	}

	function buyDryRun (address tokenAddress, uint value, uint minPrice) public view returns (uint) {
		lachesis.cut(tokenAddress);
		uint amountToPurchaseWith = value.sub(kharon.toll(tokenAddress,value));

		uint currentTokens = tokenScarcityObligations[tokenAddress].square().safeRightShift(factor);
		uint finalTokens = currentTokens.add(amountToPurchaseWith);
		uint finalScarcity = (finalTokens.safeLeftShift(factor)).sqrtImprecise();
		uint scarcityToPrint = finalScarcity.sub(tokenScarcityObligations[tokenAddress]);

		require(minPrice == 0 || scarcityToPrint >= minPrice.mul(amountToPurchaseWith), "price slippage (min) exceeded tolerance.");
		require(scarcityToPrint > 0, "No scarcity generated.");
		return scarcityToPrint;
	}

	function sell (address tokenAddress, uint scarcityValue, address seller, uint maxPrice) private returns (uint tokensToSendToUser){
		lachesis.cut(tokenAddress);
		address scarcityAddress = getScarcityAddress();
		Scarcity(scarcityAddress).transferToBehodler(seller, scarcityValue);

		uint currentObligation = tokenScarcityObligations[tokenAddress];

		require(scarcityValue <= currentObligation,"value of scarcity sold exceeds token reserves");
		ERC20Like(scarcityAddress).approve(address(kharon),uint(-1));
		uint scarcityToSell = scarcityValue.sub(kharon.demandPayment(scarcityAddress,scarcityValue,seller));

		Scarcity(scarcityAddress).burn(scarcityToSell);

		uint scarcityAfter = currentObligation.sub(scarcityToSell);
		uint tokenObligations = currentObligation.square().safeRightShift(factor);
		uint tokensAfter = scarcityAfter.square().safeRightShift(factor);

		tokensToSendToUser = (tokenObligations.sub(tokensAfter));//no spread

		require(tokensToSendToUser > 0, "No tokens released.");
		require(maxPrice == 0 || scarcityToSell <= maxPrice.mul(tokensToSendToUser), "price slippage (max) exceeded tolerance.");

		tokenScarcityObligations[tokenAddress] = scarcityAfter;
		ERC20Like(tokenAddress).transfer(seller,tokensToSendToUser);
		emit scarcitySold(tokenAddress,scarcityValue, tokensToSendToUser);
		chronos.stamp(tokenAddress,scarcityValue,tokensToSendToUser);
	}


	function sellDryRun (address tokenAddress, uint scarcityValue, uint maxPrice) public view returns (uint tokensToSendToUser){
		lachesis.cut(tokenAddress);
		address scarcityAddress = getScarcityAddress();
		uint currentObligation = tokenScarcityObligations[tokenAddress];
		require(scarcityValue <= currentObligation,"value of scarcity sold exceeds token reserves");
		uint scarcityToSell = scarcityValue.sub(kharon.toll(scarcityAddress,scarcityValue));

		uint scarcityAfter = currentObligation.sub(scarcityToSell);
		uint tokenObligations = currentObligation.square().safeRightShift(factor);
		uint tokensAfter = scarcityAfter.square().safeRightShift(factor);

		tokensToSendToUser = (tokenObligations.sub(tokensAfter));//no spread

		require(tokensToSendToUser > 0, "No tokens released.");
		require(maxPrice == 0 || scarcityToSell <= maxPrice.mul(tokensToSendToUser), "price slippage (max) exceeded tolerance.");
	}


	event scarcitySold(address token, uint scx,uint tokenValue);
	event scarcityBought(address token, uint scx,uint tokenValue);
}