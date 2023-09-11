"use client";

import React from "react";

import { Flex, Text, Grid, Tabs } from "@radix-ui/themes";
import * as Form from "@radix-ui/react-form";
import * as Select from "@radix-ui/react-select";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";

// import "./select.css";

export default function ModbusConfigForm() {
  return (
    <Grid columns="3" gap="3">
      <Flex direction="column" gap="3"></Flex>
      <Flex direction="column" gap="3">
        <ModbusConfigFormsTabs />
      </Flex>
      <Flex direction="column" gap="3"></Flex>
    </Grid>
  );
}

function ModbusConfigFormsTabs() {
  return (
    <Tabs.Root className="TabsRoot" defaultValue="Modbus">
      <Tabs.List className="TabsList" aria-label="Manage Modbus Configurations">
        <Tabs.Trigger className="TabsTrigger" value="Modbus">
          Modbus Configurations
        </Tabs.Trigger>
        <Tabs.Trigger className="TabsTrigger" value="ADAM">
          ADAM Configurations
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content className="TabsContent" value="Modbus">
        <p>
          <Text>Settings for Modbus Serial Connection</Text>
        </p>
        <ModbusForm />
      </Tabs.Content>
      <Tabs.Content className="TabsContent" value="ADAM">
        <p>
          <Text>Settings for ADAM 6024</Text>
        </p>
        <ADAMForm />
      </Tabs.Content>
    </Tabs.Root>
  );
}

function ADAMForm() {
  return (
    <Form.Root className="FormRoot">
      <Form.Field className="FormField" name="OutputMode">
        <div>
          <Form.Label className="FormLabel">Output Mode</Form.Label>
          <Form.Message className="FormMessage" match="typeMismatch">
            Please provide a valid value for output mode
          </Form.Message>
        </div>
        <Form.Control asChild>
          <Select.Root>
            <Select.Trigger>
              <Select.Value placeholder="Select an output mode">
                Select an output mode
              </Select.Value>
              <Select.Icon className="SelectIcon">
                <ChevronDownIcon />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="SelectContent">
                <Select.ScrollUpButton className="SelectScrollButton">
                  <ChevronUpIcon />
                </Select.ScrollUpButton>

                <Select.Viewport className="SelectViewport">
                  <Select.Item value="1">0 to 20 mA</Select.Item>
                  <Select.Item value="2">4 to 20 mA</Select.Item>
                  <Select.Item value="3">0 to 10 V</Select.Item>
                </Select.Viewport>
                <Select.ScrollDownButton className="SelectScrollButton">
                  <ChevronDownIcon />
                </Select.ScrollDownButton>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </Form.Control>
      </Form.Field>

      <Text weight="bold">Temperature Range</Text>
      <Form.Field className="FormField" name="Mintemp">
        <div>
          <Form.Label className="FormLabel">Min. Temperature</Form.Label>
          <Form.Message className="FormMessage" match="typeMismatch">
            Please provide a valid value for minimum temperature
          </Form.Message>
        </div>
        <Form.Control asChild>
          <input className="Input" type="text" />
        </Form.Control>
      </Form.Field>

      <Form.Field className="FormField" name="Maxtemp">
        <div>
          <Form.Label className="FormLabel">Max Temperature</Form.Label>
          <Form.Message className="FormMessage" match="typeMismatch">
            Please provide a valid value for maximum temperature
          </Form.Message>
        </div>
        <Form.Control asChild>
          <input className="Input" type="text" />
        </Form.Control>
      </Form.Field>

      <Text weight="bold">A/O port 1</Text>
      <Form.Field className="FormField" name="camera-id-1">
        <div>
          <Form.Label className="FormLabel">Camera ID</Form.Label>
          <Form.Message className="FormMessage" match="typeMismatch">
            Please provide a valid value for Camera ID
          </Form.Message>
        </div>
        <Form.Control asChild>
          <input className="Input" type="text" />
        </Form.Control>
      </Form.Field>

      <Form.Field className="FormField" name="roi-id-1">
        <div>
          <Form.Label className="FormLabel">ROI ID</Form.Label>
          <Form.Message className="FormMessage" match="typeMismatch">
            Please provide a valid value for ROI ID
          </Form.Message>
        </div>
        <Form.Control asChild>
          <input className="Input" type="text" />
        </Form.Control>
      </Form.Field>

      <Text weight="bold">A/O port 2</Text>
      <Form.Field className="FormField" name="camera-id-2">
        <div>
          <Form.Label className="FormLabel">Camera ID</Form.Label>
          <Form.Message className="FormMessage" match="typeMismatch">
            Please provide a valid value for Camera ID
          </Form.Message>
        </div>
        <Form.Control asChild>
          <input className="Input" type="text" />
        </Form.Control>
      </Form.Field>

      <Form.Field className="FormField" name="roi-id-2">
        <div>
          <Form.Label className="FormLabel">ROI ID</Form.Label>
          <Form.Message className="FormMessage" match="typeMismatch">
            Please provide a valid value for ROI ID
          </Form.Message>
        </div>
        <Form.Control asChild>
          <input className="Input" type="text" />
        </Form.Control>
      </Form.Field>

      <Text weight="bold">ADAM 6024 device configurations</Text>
      <Form.Field className="FormField" name="IPAddress">
        <div>
          <Form.Label className="FormLabel">IP Address</Form.Label>
          <Form.Message className="FormMessage" match="typeMismatch">
            Please provide a valid value for IP Address
          </Form.Message>
        </div>
        <Form.Control asChild>
          <input className="Input" type="text" />
        </Form.Control>
      </Form.Field>

      <Form.Field className="FormField" name="port">
        <div>
          <Form.Label className="FormLabel">Port Number</Form.Label>
          <Form.Message className="FormMessage" match="typeMismatch">
            Please provide a valid value for Port number
          </Form.Message>
        </div>
        <Form.Control asChild>
          <input className="Input" type="text" />
        </Form.Control>
      </Form.Field>

      <Form.Submit asChild>
        <button className="Button" style={{ marginTop: 10 }}>
          Save changes
        </button>
      </Form.Submit>
    </Form.Root>
  );
}

function ModbusForm() {
  return (
    <Form.Root className="FormRoot">
      <Form.Field className="FormField" name="Parity">
        <div>
          <Form.Label className="FormLabel">Parity</Form.Label>
          <Form.Message className="FormMessage" match="typeMismatch">
            Please provide a valid value for parity
          </Form.Message>
        </div>
        <Form.Control asChild>
          <input className="Input" type="text" />
        </Form.Control>
      </Form.Field>

      <Form.Field className="FormField" name="Baudrate">
        <div>
          <Form.Label className="FormLabel">Baud rate</Form.Label>
          <Form.Message className="FormMessage" match="typeMismatch">
            Please provide a valid value for baud rate
          </Form.Message>
        </div>
        <Form.Control asChild>
          <input className="Input" type="text" />
        </Form.Control>
      </Form.Field>

      <Form.Field className="FormField" name="Databits">
        <div>
          <Form.Label className="FormLabel">Data bits</Form.Label>
          <Form.Message className="FormMessage" match="typeMismatch">
            Please provide a valid value for data bits
          </Form.Message>
        </div>
        <Form.Control asChild>
          <input className="Input" type="text" />
        </Form.Control>
      </Form.Field>

      <Form.Field className="FormField" name="Stopbits">
        <div>
          <Form.Label className="FormLabel">Stop bits</Form.Label>
          <Form.Message className="FormMessage" match="typeMismatch">
            Please provide a valid value for stop bits
          </Form.Message>
        </div>
        <Form.Control asChild>
          <input className="Input" type="text" />
        </Form.Control>
      </Form.Field>

      <Form.Submit asChild>
        <button className="Button" style={{ marginTop: 10 }}>
          Save changes
        </button>
      </Form.Submit>
    </Form.Root>
  );
}
