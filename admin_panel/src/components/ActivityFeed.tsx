import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface ActivityFeedProps {
  onViewClaim: (claimId: string) => void;
}

const activities = [
  {
    id: '1',
    type: 'fraud',
    message: 'Fraud Detection Agent flagged Claim #1042',
    detail: 'Anomaly Score 0.81',
    time: '2 min ago',
    claimId: 'CLM-1042',
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    id: '2',
    type: 'update',
    message: 'Risk Agent updated settlement for Claim #1035',
    detail: 'Updated to ₹45,200',
    time: '5 min ago',
    claimId: 'CLM-1035',
    icon: TrendingUp,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    id: '3',
    type: 'approved',
    message: 'Claim #1028 auto-approved',
    detail: 'Confidence: 0.94',
    time: '8 min ago',
    claimId: 'CLM-1028',
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    id: '4',
    type: 'pending',
    message: 'Claim #1019 waiting for document verification',
    detail: 'Police report required',
    time: '12 min ago',
    claimId: 'CLM-1019',
    icon: Clock,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    id: '5',
    type: 'fraud',
    message: 'Duplicate invoice detected in Claim #1008',
    detail: 'Hash match with CLM-0892',
    time: '18 min ago',
    claimId: 'CLM-1008',
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    id: '6',
    type: 'approved',
    message: 'Claim #1001 auto-approved',
    detail: 'Confidence: 0.96',
    time: '25 min ago',
    claimId: 'CLM-1001',
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
];

export function ActivityFeed({ onViewClaim }: ActivityFeedProps) {
  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-3">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div
              key={activity.id}
              className="flex gap-4 cursor-pointer hover:bg-gray-50 p-4 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200"
              onClick={() => onViewClaim(activity.claimId)}
            >
              <div className={`${activity.bg} p-3 rounded-xl h-fit flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${activity.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm mb-1">{activity.message}</p>
                <p className="text-sm text-gray-600 mb-2">{activity.detail}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-gray-300">{activity.claimId}</Badge>
                  <span className="text-xs text-gray-400">• {activity.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
