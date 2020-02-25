pragma solidity ^0.6.1;

abstract contract WeiDaiLike
{
    function burn (address holder, uint value) external virtual;
}