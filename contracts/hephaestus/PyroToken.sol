pragma solidity ^0.6.1;
import "../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "./Bellows.sol";
import "./PyroTokenRegistry.sol";
import "../contractFacades/PatienceRegulationEngineLike.sol";
import "../contractFacades/ERC20Like.sol";
import "../Kharon.sol";
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
	Bellows public bellows;
	Kharon public kharon;
	PyroTokenRegistry public registry;

	constructor (string memory n, string memory s, address bellow,address k, address r) public{
		name = n;
		symbol = s;
		bellows = Bellows(bellow);
		registry = PyroTokenRegistry(r);
		kharon = Kharon(k);
	}

	function decimals() external pure returns (uint8) {
		return 18;
	}

	function engulf (address pyroRecipient, uint value) external returns (bool) {
		address baseTokenAddress = registry.pyroTokenMapping(address(this));
		require(ERC20Like(baseTokenAddress).transferFrom(msg.sender,address(this),value),"transfer of base token from sender failed");
		uint redeemRate = bellows.getRedeemRate(address(this));
		uint pyroToProduce = value.mul(10000).div(redeemRate);
		_mint(address(this),pyroToProduce);
		ERC20Like(baseTokenAddress).approve(address(bellows),value);
		bellows.open(baseTokenAddress,value);
		ERC20Like(address(this)).transfer(pyroRecipient,pyroToProduce);
	}

	function burn (uint value) external returns (uint) {
		uint splitRate = kharon.PatienceRegulationEngine().getDonationSplit(msg.sender);
		uint donation = splitRate.mul(value).div(100);
		uint valueToBurn = value;
		if(donation > 0) {
			_transfer(msg.sender, address(kharon), donation);
		}
		valueToBurn = value.sub(donation);
		_burn(msg.sender, valueToBurn);
		return valueToBurn;
	}
}