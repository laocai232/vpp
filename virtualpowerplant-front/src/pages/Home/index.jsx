import React, { useEffect, useState } from "react";

import Header from "./components/header/header";

import './style.css';

import mainImg from '../../assets/img/bg-img.png';
import Footer from "./components/footer/footer";

export default function Home() {
    const[colorHeader, setColorHeader] = useState(false);
    const imgCardSize = 60;

    useEffect(() => {
        const scrollListener = () => {
            setColorHeader(window.scrollY > 35);
        }

        window.addEventListener('scroll', scrollListener);

        return () => {
            window.removeEventListener('scroll', scrollListener)
        }
    }, []);

    /*function scrollTop() {
        window.scrollTo({   
            top: 0,
            behavior: 'smooth'
        })
    }*/

    return(
        <>
            <div className="page">
                <Header color={colorHeader} />
                <div className="first-look" style={{
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundImage: `url(${mainImg})`,
                }}>
                    <div className="first-look-v">
                        <div className="first-look-slogan">
                        虚拟电厂：以智能调度激活分散能源，打造更强韧性、更高绿电占比的未来电网。
                        </div>

                        <div className="first-look-description">
                        作为能源互联网的关键使能技术，虚拟电厂通过聚合分布式可再生资源与柔性负荷，实现源网荷储协同优化，推动电力系统向韧性化、去中心化、低碳化的下一代模式演进。
                        </div>

                        <div className="first-look-buttons">
                            <a href="/login" className="btn-1">登录</a>
                            {/* <a href="/" className="btn-2">立即购买</a> */}
                        </div>
                    </div>
                </div>
                
                <div className="body-content">
                    {/* <div className="content-1">
                        <div className="content-1-txt">
                            <div style={{fontWeight: 'bold', fontSize: '24px'}}>
                                <p>我们通过尖端软件引领能源变革</p>
                            </div>
                            <div className="content-1-txt-bd">
                            虚拟电厂提供一个平台，通过电力交易和分配、峰值需求避免、需求响应和电网稳定管理服务来优化太阳能和电池能源资源。支持风险配置管理、资产调度和金融交易的交易功能，作为虚拟电厂（VPP）运营商。
                            </div>
                        </div>
                        <div className="content-1-img">
                            <img height={320} width={320} src="src\assets\img\logo.png" alt="logo" />
                        </div>
                    </div> */}

<div className="content-2">
                        <div className="content-2-cards">
                            <div className="card">
                                <div className="card-body">
                                    <img
                                        height={imgCardSize}
                                        width={imgCardSize}
                                        alt="icon"
                                        src="src/assets/img/logo.png"
                                    />
                                    <h1>系统调频</h1>
                                    <p>了解我们的系统调频方案如何改变能源行业。</p>
                                    <a href="/casestudy?mode=readonly" className="read-link">阅读</a>
                                </div>
                            </div>
                            <div className="card">
                                <div className="card-body">
                                    <img
                                        height={imgCardSize}
                                        width={imgCardSize}
                                        alt="icon"
                                        src="src/assets/img/logo.png"
                                    />
                                    <h1>综合能源管理</h1>
                                    <p>发现我们的能源管理方案。</p>
                                    <a href="/emsmanagement?mode=readonly" className="read-link">阅读</a>
                                </div>
                            </div>
                            <div className="card">
                                <div className="card-body">
                                <img
                                    height={imgCardSize}
                                    width={imgCardSize} 
                                    alt="icon"
                                    src="src/assets/img/logo.png"
                                />
                                    <h1>技术文档</h1>
                                    <p>下载技术文档和产品资料。</p>
                                    <a href="/login" className="read-link">阅读</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <Footer /> */}
            </div>
        </>
    );
}
