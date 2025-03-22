import { Card, Space } from 'antd';

export function NoMatchPage() {
  return (
    <Space
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '98vh',
      }}
    >
      <Card>
        <div>
          <h3>Упс!</h3>
          <p>К сожалению, мы не смогли найти запрашиваемую вами страницу</p>
          <p>
            <i>404 Not found</i>
          </p>
        </div>
      </Card>
    </Space>
  );
}
