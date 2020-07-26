pragma solidity 0.4.24;

import "./Token.sol";

contract EthSwap {
  Token public token;
  uint256 public rate;

  event TokensPurchased(
    address account,
    address token,
    uint amount

  );

  event TokensSold(
    address account,
    address token,
    uint amount

  );

  constructor(Token _token) public {
    token = _token;
  }

  function buyTokens(uint256 _rate) public payable {
    uint tokenAmount = msg.value * _rate / 100;
    require(token.balanceOf(address(this)) >= tokenAmount);
    token.transfer(msg.sender, tokenAmount);
    emit TokensPurchased(msg.sender, address(token), tokenAmount);
  }

  function sellTokens(uint _amount, uint256 _rate) public {
    require(token.balanceOf(msg.sender) >= _amount);
    uint etherAmount = _amount * 100 / _rate;
    require(address(this).balance >= etherAmount);
    token.transferFrom(msg.sender, address(this), _amount);
    msg.sender.transfer(etherAmount);
    emit TokensSold(msg.sender, address(token), _amount);
  }

}
