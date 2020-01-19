pragma solidity ^0.6.1;

abstract contract PatienceRegulationEngineLike{
	function getDonationSplit(address user) external virtual view returns (uint);
	function buyWeiDai(uint dai, uint split) external virtual;
	function claimWeiDai() external virtual;
}