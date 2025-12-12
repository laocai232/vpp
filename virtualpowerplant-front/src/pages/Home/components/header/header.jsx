import React from "react";

import './header.css';

import logo from '../../../../assets/img/logo.png'

export default function Header({color}){
    return(
        <header className={color ? 'black' : ''}>
          <div className="logo--img">
            <a href="/">
              <img src={logo} alt="logo" />
            </a>
          </div>

          {/* <div className="links--list">
            <ul>
              <li><a href="/" style={ color ? {} : {fontWeight: 'bold'}} >关于我们</a></li>
              <li><a href="/" style={ color ? {} : {fontWeight: 'bold'}} >解决方案</a></li>
              <li><a href="/" style={ color ? {} : {fontWeight: 'bold'}} >购买</a></li>
              <li><a href="/login" style={ color ? {} : {fontWeight: 'bold'}} >登录</a></li>
            </ul>
          </div> */}
        </header>
    );
}