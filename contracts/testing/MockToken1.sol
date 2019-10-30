pragma solidity  0.5;
import "../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";


contract MockToken1 is ERC20
{
	constructor() public {
		_mint(msg.sender,1000000000 ether);
	}
}