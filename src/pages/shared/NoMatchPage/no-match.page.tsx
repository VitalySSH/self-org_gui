import { Button, Image } from 'antd';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import './no-match.page.scss';

export function NoMatchPage() {
  const navigate = useNavigate();

  const handleGoHome = useCallback(() => {
    navigate('/', { preventScrollReset: true });
  }, [navigate]);

  const handleGoBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/', { preventScrollReset: true });
    }
  }, [navigate]);

  const onClickLogo = useCallback(() => {
    navigate('/', { preventScrollReset: true });
  }, [navigate]);

  return (
    <div className="error-space">
      <div className="error-logo-container">
        <Image
          height={60}
          preview={false}
          src="/utu_logo.png"
          onClick={onClickLogo}
          className="error-logo"
          alt="UTU Logo"
        />
      </div>

      <div className="error-container">
        <div className="error-content">
          <div className="error-icon">
            <span className="error-code">404</span>
          </div>

          <div className="error-header">
            <h1 className="error-title">Упс! Страница не найдена</h1>
            <p className="error-subtitle">
              К сожалению, мы не смогли найти запрашиваемую вами страницу.
              Возможно, она была перемещена или удалена.
            </p>
          </div>

          <div className="error-actions">
            <Button
              type="default"
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={handleGoBack}
              className="ant-btn ant-btn-default error-action-secondary"
            >
              Назад
            </Button>

            <Button
              type="primary"
              size="large"
              icon={<HomeOutlined />}
              onClick={handleGoHome}
              className="ant-btn ant-btn-primary error-action-primary"
            >
              На главную
            </Button>
          </div>
        </div>

        <div className="error-decoration">
          <div className="error-floating-element error-floating-1"></div>
          <div className="error-floating-element error-floating-2"></div>
          <div className="error-floating-element error-floating-3"></div>
        </div>
      </div>
    </div>
  );
}