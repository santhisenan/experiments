import "@radix-ui/themes/styles.css";

import { Heading, Theme, Text } from "@radix-ui/themes";
import ModbusConfigForm from "./ThemeTest";

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
