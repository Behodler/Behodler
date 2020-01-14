pragma solidity 0.5;

contract PatienceRegulationEngineLike{
	function getDonationSplit(address user) public view returns (uint);
	function buyWeiDai(uint dai, uint split) public;
	function claimWeiDai() public;
}