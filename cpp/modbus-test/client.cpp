#include <iostream>

extern "C"
{
#include "modbus.h"
}

enum ConnectionTypes
{
    RTU,
    TCP,
    TCP_PI
};

struct Options
{
    enum ConnectionTypes Type;
    char *Address;
    char Port[6];
};

struct Options ReadFlags(int argc, char **(argv))
{
    struct Options ret =
        {
            // Default values
            .Type = TCP,
            .Address = "127.0.0.1",
            .Port = "1502"};

    return ret;
}

int main(int argc, char **argv)
{
    struct Options opt = ReadFlags(argc, argv);
    modbus_t *client = NULL;

    int sock = -1;
    int status = -1;

    switch (opt.Type)
    {
    case TCP:
        client = modbus_new_tcp(opt.Address, atoi(opt.Port));
        break;
    case TCP_PI:
        client = modbus_new_tcp_pi(opt.Address, opt.Port);
    default:
        return 1;
    }

    status = modbus_connect(client);

    if (status == -1)
    {
        std::cerr << "Failed to connect to server " << opt.Address << ": " << opt.Port << std::endl;
        modbus_free(client);
        return 1;
    }

    std::cout << "Setup finished.\nInput [r/w reg# val] (val will be ignored if r is entered)" << std::endl;
    while (1)
    {
        char read_write = 0;
        int reg_number = 0;
        int value = 0;

        std::cin >> read_write >> reg_number >> value;

        if (read_write == 'r')
        {
            status = modbus_read_registers(client, reg_number, 1, ((uint16_t *)&value));

            if (status != 1)
            {
                std::cerr << "Error" << errno << " while reading register " << modbus_strerror(errno) << std::endl;
                continue;
            }

            std::cout << "\t" << value << std::endl;
        }

        else if (read_write == 'w')
        {
            status = modbus_write_registers(client, reg_number, 1, (uint16_t *)&value);

            if (status != 1)
            {
                std::cerr << "ERROR " << errno << " while writing to register: " << modbus_strerror(errno) << std::endl;
                continue;
            }
        }
    }
}