import { Space, Button } from 'antd';
import { useNavigate } from '../../utils/navigation-handler';

interface QuickLink {
  path: string;
  label: string;
}

const QUICK_LINKS: QuickLink[] = [{ path: '/store', label: 'Shop All' }];

interface NavbarQuickLinksProps {
  appName?: string;
}

function NavbarQuickLinks({ appName }: NavbarQuickLinksProps) {
  const navigate = useNavigate(appName);

  return (
    <Space size="small" style={{ flex: 1 }}>
      {QUICK_LINKS.map((link) => (
        <Button
          key={`${link.path}-${link.label}`}
          type="primary"
          onClick={() => navigate(link.path)}
        >
          {link.label}
        </Button>
      ))}
    </Space>
  );
}

export default NavbarQuickLinks;
