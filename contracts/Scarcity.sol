pragma solidity  0.5;
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";


contract Scarcity is ERC20, Secondary
{
	address behodler;
	modifier onlyBehodler(){
		require(behodler != address(0), "Behodler contract not set.");
		require(msg.sender == behodler, "Only the Behodler contract can invoke this function.");
		_;
	}

	function setBehodler(address b) public onlyPrimary {
		behodler = b;
	}

	function mint(address recipient, uint value) public onlyBehodler{
		_mint(recipient, value);
	}

	function burn (uint value) public {
		_burn(msg.sender,value);
	}

	function transferToBehodler(address holder, uint value) public returns (bool){
		_transfer(holder, behodler, value);
		return true;
	}

	function name() public pure returns (string memory) {
		return "Scarcity";
	}

	function symbol() public pure returns (string memory) {
		return "SCX";
	}

	function decimals() public pure returns (uint8) {
		return 18;
	}
}