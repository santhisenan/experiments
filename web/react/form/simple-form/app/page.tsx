import "@radix-ui/themes/styles.css";

import { Heading, Theme, Text } from "@radix-ui/themes";
import ModbusConfigForm from "./ModbusConfigForm";

// import "./styles.css";

export default function HomePage() {
  return (
    <Theme>
      <div>
        <Heading>Hardware Configurations</Heading>
        <ModbusConfigForm />
      </div>
    </Theme>
  );
}
