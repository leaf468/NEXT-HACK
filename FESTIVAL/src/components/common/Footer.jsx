import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3 className="footer-title">캠퍼스 페스티벌</h3>
                    <p className="footer-description">
                        전국 대학교 축제 정보를 한눈에 확인하세요.
                    </p>
                </div>

                <div className="footer-section">
                    <h3 className="footer-title">바로가기</h3>
                    <ul className="footer-links">
                        <li>
                            <Link to="/">홈</Link>
                        </li>
                        <li>
                            <Link to="/search/school">학교별 검색</Link>
                        </li>
                        <li>
                            <Link to="/search/artist">아티스트별 검색</Link>
                        </li>
                        <li>
                            <Link to="/favorites">즐겨찾기</Link>
                        </li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3 className="footer-title">문의</h3>
                    <p className="footer-contact">
                        이메일: info@campusfestival.kr
                        <br />
                        전화: 02-123-4567
                    </p>
                </div>
            </div>

            <div className="footer-bottom">
                <p>
                    &copy; {new Date().getFullYear()} 캠퍼스 페스티벌. All
                    rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
