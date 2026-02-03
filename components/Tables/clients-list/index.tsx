
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const clientsData = [
  {
    id: 1,
    name: "Sarah Johnson",
    assignment: "Electronics",
    status: "Working",
    statusColor: "bg-green-100 text-green-800",
    lastNote: "2 days ago",
    shift: "9:00 AM - 3:00 PM"
  },
  {
    id: 2,
    name: "Michael Chen",
    assignment: "Donations",
    status: "Scheduled",
    statusColor: "bg-blue-100 text-blue-800",
    lastNote: "1 week ago",
    shift: "10:00 AM - 2:00 PM"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    assignment: "Housewares",
    status: "Working",
    statusColor: "bg-green-100 text-green-800",
    lastNote: "3 days ago",
    shift: "8:00 AM - 12:00 PM"
  },
  {
    id: 4,
    name: "David Thompson",
    assignment: "Shredding",
    status: "Absent",
    statusColor: "bg-red-100 text-red-800",
    lastNote: "Yesterday",
    shift: "1:00 PM - 5:00 PM"
  }
];

export async function ClientsList({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid rounded-[var(--radius)] bg-[hsl(var(--background))] px-7.5 pb-4 pt-7.5 shadow-[var(--shadow-sm)] dark:bg-[hsl(var(--card))] dark:shadow-[var(--shadow-md)]",
        className,
      )}
    >
      <h2 className="mb-4 text-body-2xlg font-bold text-[hsl(var(--foreground))] dark:text-[hsl(var(--card-foreground))]">
        Your Clients
      </h2>

      <Table>
        <TableHeader>
          <TableRow className="border-none uppercase [&>th]:text-center">
            <TableHead className="min-w-[120px] !text-left">Client</TableHead>
            <TableHead>Assignment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Note</TableHead>
            <TableHead className="!text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {clientsData.map((client) => (
            <TableRow
              className="text-center text-base font-medium text-[hsl(var(--foreground))] dark:text-[hsl(var(--card-foreground))]"
              key={client.id}
            >
              <TableCell className="flex min-w-fit items-center gap-3">
                <div className="size-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold">
                  {client.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="text-left">
                  <div className="font-medium">{client.name}</div>
                  <div className="text-sm text-gray-500">{client.shift}</div>
                </div>
              </TableCell>

              <TableCell>{client.assignment}</TableCell>

              <TableCell>
                <Badge className={client.statusColor} variant="secondary">
                  {client.status}
                </Badge>
              </TableCell>

              <TableCell>{client.lastNote}</TableCell>

              <TableCell className="!text-right">
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm">
                    Note
                  </Button>
                  <Button variant="outline" size="sm">
                    Message
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}