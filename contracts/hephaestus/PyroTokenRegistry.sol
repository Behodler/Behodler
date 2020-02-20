pragma solidity ^0.6.1;

import "../../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "./PyroToken.sol";
import "./Lachesis.sol";

contract PyroTokenRegistry is Secondary{
	mapping (address=>address) public baseTokenMapping;
	mapping (address=>address) public pyroTokenMapping;
	address public bellows;
	address public kharon;
	Lachesis lachesis;

	function seed(address b, address l, address k) external onlyPrimary {
		bellows = b;
		lachesis = Lachesis(l);
		kharon = k;
	}

	function addToken(string calldata name, string calldata symbol, address baseToken) external onlyPrimary {
		lachesis.cut(baseToken);
		PyroToken t = new PyroToken(name, symbol, bellows, kharon, address(this));
		address pTokenAddress = address(t);
		baseTokenMapping[baseToken] = pTokenAddress;
		pyroTokenMapping[pTokenAddress] = baseToken;
		require(address(t) != address(0),"deploy contract failed");
	}
}