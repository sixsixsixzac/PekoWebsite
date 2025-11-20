"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  User,
  Settings,
  LogOut,
  Mail
} from "lucide-react"

export default function ExampleComponentsPage() {
  const [progress, setProgress] = useState(33)
  const [sliderValue, setSliderValue] = useState([50])

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">shadcn/ui Components</h1>
              <p className="text-muted-foreground mt-2">
                Complete showcase of all available components
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">← Back to Home</Button>
            </Link>
          </div>
          <Separator />
        </div>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Various button styles and variants</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button disabled>Disabled</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <Bell className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Form Elements */}
        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>Input fields, checkboxes, radios, and more</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" placeholder="Type your message here" />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <Label htmlFor="terms" className="cursor-pointer">
                Accept terms and conditions
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="notifications" />
              <Label htmlFor="notifications" className="cursor-pointer">
                Enable notifications
              </Label>
            </div>
            <RadioGroup defaultValue="option-one">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option-one" id="option-one" />
                <Label htmlFor="option-one">Option One</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option-two" id="option-two" />
                <Label htmlFor="option-two">Option Two</Label>
              </div>
            </RadioGroup>
            <div className="space-y-2">
              <Label>Select an option</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a fruit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apple">Apple</SelectItem>
                  <SelectItem value="banana">Banana</SelectItem>
                  <SelectItem value="orange">Orange</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Slider: {sliderValue[0]}</Label>
              <Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={1} />
            </div>
          </CardContent>
        </Card>

        {/* Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Cards</CardTitle>
            <CardDescription>Card component with header, content, and footer</CardDescription>
          </CardHeader>
          <CardContent>
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description goes here</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This is the card content area.</p>
              </CardContent>
              <CardFooter>
                <Button>Action</Button>
              </CardFooter>
            </Card>
          </CardContent>
        </Card>

        {/* Badges & Avatars */}
        <Card>
          <CardHeader>
            <CardTitle>Badges & Avatars</CardTitle>
            <CardDescription>Status indicators and user avatars</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
            <div className="flex gap-4">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>AB</AvatarFallback>
              </Avatar>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <CardDescription>Alert messages and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Info</AlertTitle>
              <AlertDescription>
                This is an informational alert message.
              </AlertDescription>
            </Alert>
            <Alert variant="default">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Operation completed successfully.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Something went wrong. Please try again.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Progress & Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle>Progress & Skeleton</CardTitle>
            <CardDescription>Loading indicators and progress bars</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
              <Button onClick={() => setProgress(Math.min(100, progress + 10))}>
                Increase Progress
              </Button>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Tabs</CardTitle>
            <CardDescription>Tabbed interface component</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="account" className="w-full">
              <TabsList>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="account" className="space-y-2">
                <p>Account settings content goes here.</p>
              </TabsContent>
              <TabsContent value="password" className="space-y-2">
                <p>Password settings content goes here.</p>
              </TabsContent>
              <TabsContent value="settings" className="space-y-2">
                <p>General settings content goes here.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Accordion */}
        <Card>
          <CardHeader>
            <CardTitle>Accordion</CardTitle>
            <CardDescription>Collapsible content sections</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Is it accessible?</AccordionTrigger>
                <AccordionContent>
                  Yes. It adheres to the WAI-ARIA design pattern.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Is it styled?</AccordionTrigger>
                <AccordionContent>
                  Yes. It comes with default styles that match the other components.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Is it animated?</AccordionTrigger>
                <AccordionContent>
                  Yes. It's animated by default, but you can disable it if you prefer.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Dialogs */}
        <Card>
          <CardHeader>
            <CardTitle>Dialogs</CardTitle>
            <CardDescription>Modal dialogs and alert dialogs</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button>Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove your data from our servers.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline">Cancel</Button>
                  <Button variant="destructive">Continue</Button>
                </div>
              </DialogContent>
            </Dialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Open Alert Dialog</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* Popover & Tooltip */}
        <Card>
          <CardHeader>
            <CardTitle>Popover & Tooltip</CardTitle>
            <CardDescription>Contextual overlays and hints</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Open Popover</Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Dimensions</h4>
                  <p className="text-sm text-muted-foreground">
                    Set the dimensions for the layer.
                  </p>
                </div>
              </PopoverContent>
            </Popover>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover for Tooltip</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This is a tooltip</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardContent>
        </Card>

        {/* Dropdown Menu */}
        <Card>
          <CardHeader>
            <CardTitle>Dropdown Menu</CardTitle>
            <CardDescription>Context menus and dropdowns</CardDescription>
          </CardHeader>
          <CardContent>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Open Menu</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Table</CardTitle>
            <CardDescription>Data tables and grids</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>John Doe</TableCell>
                  <TableCell>john@example.com</TableCell>
                  <TableCell>Admin</TableCell>
                  <TableCell>
                    <Badge>Active</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Jane Smith</TableCell>
                  <TableCell>jane@example.com</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Inactive</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Bob Johnson</TableCell>
                  <TableCell>bob@example.com</TableCell>
                  <TableCell>Editor</TableCell>
                  <TableCell>
                    <Badge>Active</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Date picker calendar</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" className="rounded-md border" />
          </CardContent>
        </Card>

        {/* Toast Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Toast Notifications</CardTitle>
            <CardDescription>Toast messages using Sonner</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button onClick={() => toast("Event has been created")}>
              Show Toast
            </Button>
            <Button onClick={() => toast.success("Success!")} variant="default">
              Success Toast
            </Button>
            <Button onClick={() => toast.error("Error occurred")} variant="destructive">
              Error Toast
            </Button>
            <Button onClick={() => toast.info("Information")} variant="outline">
              Info Toast
            </Button>
          </CardContent>
        </Card>

        {/* Separator */}
        <Card>
          <CardHeader>
            <CardTitle>Separator</CardTitle>
            <CardDescription>Visual dividers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>Content above</div>
            <Separator />
            <div>Content below</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

