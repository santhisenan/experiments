#include <iostream>

extern "C"
{
#include "modbus.h"
}
using namespace std;

int main(void)
{
    modbus_t *mb;
    uint16_t tab_reg[32];

    mb = modbus_new_tcp("127.0.0.1", 1502);
    modbus_connect(mb);

    modbus_read_registers(mb, 0, 5, tab_reg);

    modbus_close(mb);
    modbus_free(mb);
    cout << "Finshed executing" << endl;
}