import React, { useEffect, useCallback } from 'react';
import { experimental_useObject as useObject } from 'ai/react';
import { CalendarIcon, ClockIcon, SunriseIcon, Info, SunIcon, ThermometerIcon, Trash2Icon, ClipboardListIcon } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from "date-fns"
import Markdown from 'react-markdown';

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { analyzeSchema as schema } from '~/schema';
import useStore from '~/store';

const dialogText = `Dr. Ray Peat said this:

> "Oral or armpit temperature in the morning, before getting out of bed, should be around 98° F [36.6* C], and it should rise to 98.6° F [37.1° C] by mid-morning. [...] Healthy populations have an average resting pulse rate of about 85 per minute."

This app is a simple temperature tracker that helps you keep track of your body temperature over time. It's designed to help you stay on track with Dr. Peat's recommendations, and to provide you with insights into your body's temperature patterns over time.

After adding some data, it will use AI to analyze your data and provide you with a summary of your body's temperature patterns. This can help you identify trends or patterns in your data, and make informed decisions about your health and well-being.

[You can view the source code for this app on GitHub](https://github.com/kristianfreeman/peaty).`

const getTimeIcon = (time: string) => {
  switch (time.toLowerCase()) {
    case 'morning':
      return <SunriseIcon size={16} className="mr-1 text-orange-400" />;
    case 'noon':
      return <SunIcon size={16} className="mr-1 text-yellow-500" />;
    default:
      return <ClockIcon size={16} className="mr-1 text-blue-400" />;
  }
}

const titleCase = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function InfoModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="ml-2">
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>About Peaty Temperature Tracker</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <Markdown className="space-y-4" components={{
            a: (props) => <a className="blue-600 underline visited:text-purple-900" {...props} />,
            p: (props) => <p className="leading-7 [&:not(:first-child)]:mt-6" {...props} />
          }}>
            {dialogText}
          </Markdown>
        </DialogDescription>
      </DialogContent>
    </Dialog >
  )
}

const App: React.FC = () => {
  const {
    entries, date, time, temperature,
    setEntries, setDate, setTime, setTemperature,
    addEntry, deleteEntry, resetForm
  } = useStore();

  const { object, isLoading, submit } = useObject({
    api: '/analyze',
    schema
  });

  useEffect(() => {
    const storedEntries = localStorage.getItem('temperatureEntries');
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    }
  }, []);

  const handleAddEntry = useCallback(async () => {
    if (date && time && temperature) {
      const newEntry = { id: Date.now(), date, time, temperature: parseFloat(temperature) };
      addEntry(newEntry);
      resetForm();
    }
  }, [date, time, temperature, addEntry, resetForm]);

  const handleDeleteEntry = useCallback((id: number) => {
    deleteEntry(id);
  }, [deleteEntry]);

  const formatDataForChart = useCallback(() => {
    const formattedData: { [key: string]: { [key: string]: number } } = {};
    entries.forEach(entry => {
      if (!formattedData[entry.date]) {
        formattedData[entry.date] = {};
      }
      formattedData[entry.date][entry.time] = entry.temperature;
    });
    return Object.keys(formattedData).map(date => ({
      date,
      ...formattedData[date]
    }));
  }, [entries]);

  useEffect(() => {
    if (!entries.length) return
    localStorage.setItem('temperatureEntries', JSON.stringify(entries));
    if (entries.length < 2) return
    submit({ entries });
  }, [entries]);

  return (
    <div className="flex w-full h-screen">
      <Card className="w-2/3 overflow-auto border-none">
        <CardHeader>
          <CardTitle>
            Peaty Temperature Tracker
            <InfoModal />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="noon">Noon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="temperature">Temperature (°F)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddEntry}>Add Entry</Button>
            </div>
          </div>

          {entries.length > 0 && (
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatDataForChart()}>
                  <XAxis dataKey="date" />
                  <YAxis domain={[95, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="morning" stroke="#8884d8" name="Morning" />
                  <Line type="monotone" dataKey="noon" stroke="#82ca9d" name="Noon" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center">
              <ClipboardListIcon className="mr-2" size={20} />
              Entered Data
            </h3>
            <ul className="space-y-3">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-gray-600">
                      <CalendarIcon size={16} className="mr-1" />
                      <span>{format(new Date(entry.date), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      {getTimeIcon(entry.time)}
                      <span>{titleCase(entry.time)}</span>
                    </div>
                    <div className="flex items-center font-medium">
                      <ThermometerIcon size={16} className="mr-1 text-red-500" />
                      <span>{entry.temperature.toFixed(1)}°F</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2Icon size={18} />
                  </Button>
                </li>
              ))}
            </ul>
            {entries.length === 0 && (
              <p className="text-gray-500 text-center italic mt-4">No entries yet. Add your first temperature record above.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="w-1/3 border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold">Analysis</h2>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {object || isLoading ? (
            <div className="space-y-4">
              {isLoading ? (
                <p>Loading analysis...</p>
              ) : (
                <>
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold mb-2">Alignment with Recommendations</h3>
                    <Markdown>{object?.alignmentWithRecommendations}</Markdown>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Trends in Data</h3>
                    <Markdown>{object?.trendsInData}</Markdown>
                  </div>
                </>
              )}
            </div>
          ) : (
            <p>No analysis available yet. Add some entries to get started!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
