import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-lg font-medium">Welcome, {user?.name}!</p>
            <p className="text-sm text-muted-foreground">Email: {user?.email}</p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link to="/products">View products</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

