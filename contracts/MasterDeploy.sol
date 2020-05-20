pragma solidity ^0.6.1;

import "./Behodler.sol";
import "./Chronos.sol";
import "./Janus.sol";
import "./Kharon.sol";
import "./Prometheus.sol";
import "./Scarcity.sol";
import "./hephaestus/Bellows.sol";
import "./hephaestus/Lachesis.sol";
import "./hephaestus/PyroTokenRegistry.sol";

contract MasterDeploy{
    address public behodler;
    address public chronos;
    address public janus;
    address public kharon;
    address public prometheus;
    address public scarcity;
    address public bellows;
    address public lachesis;
    address public pyrotokenregistry;

    function deploy(uint contractToDeploy) public {
       if(contractToDeploy == 0){
           behodler = address(new Behodler());
       } else if(contractToDeploy == 1){
           chronos = address(new Chronos());
       } else if(contractToDeploy == 2){
           janus = address(new Janus());
       } else if(contractToDeploy == 3){
           kharon = address(new Kharon());
       } else if(contractToDeploy == 4){
           behodler = address(new Behodler());
       } else if(contractToDeploy == 5){
           behodler = address(new Behodler());
       } else if(contractToDeploy == 6){
           behodler = address(new Behodler());
       }
    }
}
