pragma solidity  0.5;
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";


contract Scarcity is ERC20, Secondary
{
	address behodler;
	modifier onlyBehodler(){
		require(behodler != address(0), "Behodler contract not set.");
		require(msg.sender == behodler, "only the Behodler contract can invoke this function.");
		_;
	}

	function setBehodler(address b) public onlyPrimary {
		behodler = b;
	}

	function mint(uint value) public onlyBehodler{
		_mint(msg.sender, value);
	}

	function burn (uint value) public {
		_burn(msg.sender,value);
	}
}