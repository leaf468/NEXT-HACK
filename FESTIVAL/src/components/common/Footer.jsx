import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
    // 페이지 상단으로 스크롤하는 함수
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth", // 부드러운 스크롤 효과 적용
        });
    };

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3 className="footer-title">FIESTA</h3>
                    <p className="footer-description">
                        전국 대학교 축제 정보를 한눈에 확인하세요.
                    </p>
                </div>

                <div className="footer-section">
                    <h3 className="footer-title">바로가기</h3>
                    <ul className="footer-links">
                        <li>
                            <Link to="/" onClick={scrollToTop}>
                                홈
                            </Link>
                        </li>
                        <li>
                            <Link to="/search/school" onClick={scrollToTop}>
                                학교별 검색
                            </Link>
                        </li>
                        <li>
                            <Link to="/search/artist" onClick={scrollToTop}>
                                아티스트별 검색
                            </Link>
                        </li>
                        <li>
                            <Link to="/favorites" onClick={scrollToTop}>
                                즐겨찾기
                            </Link>
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
                    &copy; {new Date().getFullYear()} FIESTA. All
                    rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
