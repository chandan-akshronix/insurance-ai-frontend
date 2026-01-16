import { useState } from 'react';
import {
    Settings as SettingsIcon,
    Shield,
    Users,
    Bell,
    Database,
    Lock,
    Key,
    Save,
    UserPlus,
    Search,
    MoreVertical,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Separator } from './ui/separator';

const users = [
    { id: 1, name: 'Abhay Singh', email: 'abhay@insurance.com', role: 'Admin', status: 'Active', lastActive: '2 mins ago' },
    { id: 2, name: 'Priya Sharma', email: 'priya@insurance.com', role: 'Underwriter', status: 'Active', lastActive: '15 mins ago' },
    { id: 3, name: 'Rahul Verma', email: 'rahul@insurance.com', role: 'Agent', status: 'Inactive', lastActive: '2 days ago' },
    { id: 4, name: 'Surbhi Gupta', email: 'surbhi@insurance.com', role: 'Underwriter', status: 'Active', lastActive: '1 hour ago' },
];

export function Settings() {
    const [activeTab, setActiveTab] = useState('platform');

    return (
        <div className="p-10 bg-gradient-to-br from-gray-50 to-white min-h-screen">
            <div className="mb-10">
                <h1 className="text-4xl mb-2">Settings & Access Control</h1>
                <p className="text-gray-600 text-lg">Manage platform configuration, user roles, and security permissions</p>
            </div>

            <Tabs defaultValue="platform" className="space-y-8" onValueChange={setActiveTab}>
                <TabsList className="bg-white border p-1 rounded-xl shadow-sm inline-flex">
                    <TabsTrigger value="platform" className="rounded-lg px-6 flex items-center gap-2">
                        <SettingsIcon className="w-4 h-4" /> Platform
                    </TabsTrigger>
                    <TabsTrigger value="access" className="rounded-lg px-6 flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Access Control
                    </TabsTrigger>
                    <TabsTrigger value="security" className="rounded-lg px-6 flex items-center gap-2">
                        <Lock className="w-4 h-4" /> Security
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-lg px-6 flex items-center gap-2">
                        <Bell className="w-4 h-4" /> Notifications
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="platform" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <div className="flex items-center gap-2 mb-1">
                                    <Database className="w-5 h-5 text-blue-600" />
                                    <CardTitle>System Configuration</CardTitle>
                                </div>
                                <CardDescription>Configure global AI agent behaviors and system limits</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Auto-Underwriting</Label>
                                        <p className="text-sm text-gray-500">Allow AI to auto-approve low-risk claims</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Aggressive Fraud Detection</Label>
                                        <p className="text-sm text-gray-500">Lower the threshold for manual fraud review</p>
                                    </div>
                                    <Switch />
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                    <Label>Maximum Claim Amount (Auto-Process)</Label>
                                    <Input type="number" defaultValue="50000" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle>AI Agent Tuning</CardTitle>
                                <CardDescription>Adjust the sensitivity levels for different AI modules</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Label>Risk Assessment Threshold</Label>
                                            <span className="text-sm font-medium text-blue-600">85%</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full w-[85%]" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Label>NLP Confidence Score</Label>
                                            <span className="text-sm font-medium text-blue-600">92%</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full w-[92%]" />
                                        </div>
                                    </div>
                                </div>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                    <Save className="w-4 h-4 mr-2" /> Save Tuning Parameters
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="access" className="space-y-6">
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                            <div>
                                <CardTitle>User Role Management</CardTitle>
                                <CardDescription>Manage administrative users and their platform permissions</CardDescription>
                            </div>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <UserPlus className="w-4 h-4 mr-2" /> Add Admin User
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input placeholder="Search by name, email or role..." className="pl-10" />
                                </div>
                                <Button variant="outline" className="border-gray-200">Filter</Button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left py-4 border-b border-gray-100">
                                            <th className="pb-4 font-semibold text-sm text-gray-600">User</th>
                                            <th className="pb-4 font-semibold text-sm text-gray-600">Role</th>
                                            <th className="pb-4 font-semibold text-sm text-gray-600">Status</th>
                                            <th className="pb-4 font-semibold text-sm text-gray-600">Last Active</th>
                                            <th className="pb-4 font-semibold text-sm text-gray-600"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-medium">
                                                            {user.name.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm">{user.name}</p>
                                                            <p className="text-xs text-gray-500">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-sm">
                                                    <Badge variant="outline" className="font-normal border-blue-100 text-blue-700 bg-blue-50/50">
                                                        {user.role}
                                                    </Badge>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex items-center gap-2">
                                                        {user.status === 'Active' ? (
                                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                        ) : (
                                                            <XCircle className="w-4 h-4 text-gray-400" />
                                                        )}
                                                        <span className="text-sm">{user.status}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-sm text-gray-500">{user.lastActive}</td>
                                                <td className="py-4 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <MoreVertical className="w-4 h-4 text-gray-400" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem className="cursor-pointer">Edit Role</DropdownMenuItem>
                                                            <DropdownMenuItem className="cursor-pointer">View Activity</DropdownMenuItem>
                                                            <Separator className="my-1" />
                                                            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                                                                Deactivate
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="border-0 shadow-sm md:col-span-2">
                            <CardHeader>
                                <div className="flex items-center gap-2 mb-1">
                                    <Lock className="w-5 h-5 text-blue-600" />
                                    <CardTitle>API & Security Tokens</CardTitle>
                                </div>
                                <CardDescription>Manage access keys for third-party integrations and internal services</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-xs uppercase tracking-wider text-gray-500">Master Secret Key</Label>
                                            <Badge className="bg-green-100 text-green-700 border-0">Primary</Badge>
                                        </div>
                                        <div className="flex gap-2">
                                            <Input value="••••••••••••••••••••••••••••••••" readOnly className="bg-white" />
                                            <Button variant="outline" size="icon" className="shrink-0"><Key className="w-4 h-4" /></Button>
                                        </div>
                                    </div>
                                    <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-xs uppercase tracking-wider text-gray-500">Underwriting Agent Webhook</Label>
                                            <Badge variant="outline" className="font-normal">Development</Badge>
                                        </div>
                                        <div className="flex gap-2">
                                            <Input value="https://webhook.insurance.com/v1/trigger" readOnly className="bg-white" />
                                            <Button variant="outline" size="icon" className="shrink-0"><Key className="w-4 h-4" /></Button>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full">Rotate All Security Keys</Button>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle>Two-Factor Auth</CardTitle>
                                <CardDescription>Enforce 2FA for all administrative logins</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <p className="text-xs text-blue-800 leading-relaxed">
                                        Strongly recommended to prevent unauthorized access to the admin console.
                                    </p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>Required for Admins</Label>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>Session Expiry (Hrs)</Label>
                                    <Input type="number" className="w-20" defaultValue="4" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
