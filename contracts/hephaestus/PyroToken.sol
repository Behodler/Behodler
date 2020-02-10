pragma solidity ^0.6.1;
import "../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "./Bellows.sol";
import "./PyroTokenRegistry.sol";
import "../contractFacades/PatienceRegulationEngineLike.sol";
/*
PyroTokens wrap tokens traded on Behodler (except for Dai, WeiDai and Scarcity).
PyroTokens are ERC20 tokens that can engulf (wrap) a token. The base token is then added to a Bellow by opening it.
Unwrapping happens at the Bellows as a 'blast'.
Handling of Weth/Eth issues happesn at the Swap level.
generic contract for all pyro tokens. This contract is instantiated in real time with programmable name, symbol etc.
*/

contract PyroToken is Secondary, ERC20{
	string public name;
	string public symbol;
	ERC20 public baseToken;
	Bellows public bellows;
	address public kharon;
	PyroTokenRegistry public registry;

	constructor (string memory n, string memory s, address base, address bellow,address k, address r) public{
		name = n;
		symbol = s;
		baseToken = ERC20(base);
		bellows = Bellows(bellow);
		registry = PyroTokenRegistry(r);
		kharon = k;
	}

	function decimals() external pure returns (uint8) {
		return 18;
	}

	function engulf (address sender, uint value) external returns (bool) {
		require(baseToken.transferFrom(msg.sender,address(this),value),"transfer of base token from sender failed");
		uint redeemRate = bellows.getRedeemRate(address(this));
		uint pyroToProduce = value.mul(10000).div(redeemRate);
		_mint(sender,pyroToProduce);
	}

	function burn (uint value) external returns (bool) {
		_burn(msg.sender, value);
		uint splitRate = PatienceRegulationEngineLike(registry.PatienceRegulationEngine()).getDonationSplit(msg.sender);
		uint donation = splitRate.mul(value).div(100);
		uint valueToBurn = value;
		if(donation > 0) {
			_transfer(msg.sender, kharon, donation);
		}
		valueToBurn = value.sub(valueToBurn);
	}
}