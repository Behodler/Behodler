pragma solidity  0.5;
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";


contract Weth is ERC20
{
	using SafeMath for uint;
	function deposit () public payable {
		_mint(msg.sender,msg.value);
	}

	function withdraw(uint value) public {
		_burn(msg.sender,value);
		(bool success, ) = msg.sender.call.value(value)("");
		require(success, "Unwrapping failed.");
	}
}