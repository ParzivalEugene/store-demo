"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ru } from "date-fns/locale";

export const description = "A bar chart";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
};

export default function Home() {
  const [startDate, setStartDate] = useState(new Date("2024-07-15"));
  const [endDate, setEndDate] = useState(new Date("2024-07-15"));
  const [data, setData] = useState([]);

  const callApi = async () => {
    try {
      const formData = new FormData();
      formData.append("username", "79998881122");
      formData.append("password", "12345");

      const loginResponse = await fetch(
        "https://store-demo-test.ru/_admin_login_",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!loginResponse.ok) {
        throw new Error("Login request failed");
      }

      const loginData = await loginResponse.json();
      const accessToken = loginData.access_token;

      if (!accessToken) {
        throw new Error("Access token not found");
      }

      const financeResponse = await fetch(
        "https://store-demo-test.ru/_get_finance_plan_",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!financeResponse.ok) {
        throw new Error("Finance plan request failed");
      }

      const financeData = await financeResponse.json();
      console.log(financeData);
      const mappedData = financeData.finance_planfact
        .map((item) => ({
          date: item.data,
          revenue: item.revenue,
        }))
        .filter((item) => {
          const date = new Date(item.date);
          return date >= startDate && date <= endDate;
        });
      setData(mappedData);
    } catch (error) {
      console.error(error);
    }
    console.log(data);
  };

  return (
    <div className="p-12">
      <h2 className="text-2xl bold">Выберите диапазон</h2>
      <div className="py-6 flex items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? (
                format(startDate, "PPP", { locale: ru })
              ) : (
                <span>Выберите начальную дату</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? (
                format(endDate, "PPP", { locale: ru })
              ) : (
                <span>Выберите конечную дату</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              disabled={(date) => date < startDate}
              selected={endDate}
              onSelect={setEndDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button onClick={callApi}>Показать график</Button>
      </div>
      {data.length === 0 && <p>Нет данных</p>}
      {data.length > 0 && (
        <Card className="max-w-[1024px]">
          <CardHeader>
            <CardTitle>Гистограмма</CardTitle>
            <CardDescription>
              {startDate.toLocaleDateString("ru-RU")} -{" "}
              {startDate.toLocaleDateString("ru-RU")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart accessibilityLayer data={data}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  axisLine={false}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("ru-RU", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="revenue" fill="var(--color-desktop)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
