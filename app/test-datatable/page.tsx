// Test file to verify styling
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestStyling() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold">Styling Test</h1>

      {/* Test basic components */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Components Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button>Default Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="ghost">Ghost Button</Button>
          </div>

          <Input placeholder="Test input styling" className="max-w-sm" />

          <div className="bg-muted p-4 rounded-md">
            <p className="text-muted-foreground">This should have muted background and text</p>
          </div>

          <div className="border rounded-md p-4">
            <p className="text-foreground">This should have border and foreground text</p>
          </div>
        </CardContent>
      </Card>

      {/* Test table styling */}
      <Card>
        <CardHeader>
          <CardTitle>Table Styling Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Column 1
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Column 2
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Column 3
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-4 align-middle">Data 1</td>
                  <td className="p-4 align-middle">Data 2</td>
                  <td className="p-4 align-middle">Data 3</td>
                </tr>
                <tr className="border-b hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <td className="p-4 align-middle">Selected Data 1</td>
                  <td className="p-4 align-middle">Selected Data 2</td>
                  <td className="p-4 align-middle">Selected Data 3</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}