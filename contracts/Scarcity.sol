pragma solidity  0.5;
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract Scarcity is ERC20
{
	address IBC;
	modifier onlyIBC(){
		require(IBC != address(0), "IBC contract not set.");
		require(msg.sender == IBC, "only the IBC contract can invoke this function.");
		_;
	}
}