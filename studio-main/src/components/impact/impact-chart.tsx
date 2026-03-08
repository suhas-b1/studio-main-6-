'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';

const chartData = [
  { month: 'January', donations: 186, meals: 420 },
  { month: 'February', donations: 305, meals: 780 },
  { month: 'March', donations: 237, meals: 550 },
  { month: 'April', donations: 273, meals: 690 },
  { month: 'May', donations: 209, meals: 500 },
  { month: 'June', donations: 214, meals: 520 },
];

const chartConfig = {
  donations: {
    label: 'Donations',
    color: 'hsl(var(--accent))',
  },
  meals: {
    label: 'Meals Provided',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function ImpactChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Donation Trends</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
             <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="donations" fill="var(--color-donations)" radius={4} />
            <Bar dataKey="meals" fill="var(--color-meals)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
