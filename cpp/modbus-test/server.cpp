#include <iostream>
#include <thread>
#include <netdb.h> // definitions for network database operations
#include <string.h>

#ifdef _WIN32
#include <winsock.h>
#else
#include <sys/socket.h>
#endif

extern "C"
{
#include <libs/libmodbus/include/modbus/modbus.h>
}

static pthread_mutex_t db_access = PTHREAD_MUTEX_INITIALIZER;
static modbus_mapping_t *db = NULL;

enum ctx_type
{
    RTU,
    TCP,
    TCP_PI
};

struct options
{
    enum ctx_type type;
    char port[6];
    int nb_clients;
    int nb_bits;
    int nb_wbits;
    int nb_regs;
    int nb_wregs;
};

struct options ReadFlags(int argc, char **argv)
{
    struct options ret =
        {
            .type = TCP,
            .port = "1502",
            .nb_clients = 10,
            .nb_bits = MODBUS_MAX_READ_BITS,
            .nb_wbits = MODBUS_MAX_WRITE_BITS,
            .nb_regs = MODBUS_MAX_READ_REGISTERS,
            .nb_wregs = MODBUS_MAX_WR_WRITE_REGISTERS};

    return ret;
}

int FindClientName(int socket, char *name, int name_len)
{
    struct sockaddr_storage addr;
#ifdef _WIN32
    int addr_len = sizeof(addr);
#else
    socklen_t addr_len = sizeof(addr);
#endif
    int status = -1;

    status = getpeername(socket, (struct sockaddr *)&addr, &addr_len);

    if (status != 0)
    {
        std::cerr << "getpeername error " << gai_strerror(status) << std::endl;
        return -1;
    }

    status = getnameinfo((struct sockaddr *)&addr, addr_len, name, name_len, NULL, 0, NI_NUMERICHOST);
    if (status != 0)
    {
        std::cerr << "getnameinfo error " << gai_strerror(status) << std::endl;
        return -1;
    }

    return 0;
}

// Handling connections from clients in separate threads
void *HandleConnection(modbus_t *arg)
{
    modbus_t *client = arg;
    int status = -1;

    char clientName[NI_MAXHOST];
    status = FindClientName(modbus_get_socket(client), clientName, NI_MAXHOST);

    if (status != 0)
    {
        std::cerr << "Error while fetching the client name" << std::endl;
        return NULL;
    }

    std::cout << "New connection from " << clientName << std::endl;

    while (1)
    {
        uint8_t query[MODBUS_TCP_MAX_ADU_LENGTH];
        int rx_count = -1;
        int status = -1;

        rx_count = modbus_receive(client, query);

        if (rx_count > 0)
        {
            char queryString[MODBUS_TCP_MAX_ADU_LENGTH * 3 + 1];
            memset(queryString, 0, sizeof(queryString) - 1);

            for (int c = 0; c < rx_count; c++)
            {
                char tmp[4];
                sprintf(tmp, "%x ", query[c]);
                strcat(queryString, tmp);
            }

            std::cout << "Query from " << clientName << ": [" << queryString << "]" << std::endl;

            pthread_mutex_lock(&db_access);
            status = modbus_reply(client, query, rx_count, db);
            pthread_mutex_unlock(&db_access);

            if (status == -1)
            {
                std::cerr << "Error " << errno << " replying to query from " << clientName << ": " << modbus_strerror(errno) << std::endl;
            }
            else if (rx_count < 0)
            {
                // Error or closed
                std::cout << clientName << " disconnected!" << std::endl;
                return NULL;
            }
            else
            {
                // empty query
            }
        }
    }
};

main(int argc, char **argv)
{
    struct options opt = ReadFlags(argc, argv);

    modbus_t *server = NULL;
    int sock = -1;
    int status = -1;

    switch (opt.type)
    {
    case TCP:
        server = modbus_new_tcp(NULL, atoi(opt.port));
        sock = modbus_tcp_listen(server, 1);
        break;

    case TCP_PI:
        server = modbus_new_tcp_pi(NULL, opt.port);
        sock = modbus_tcp_pi_listen(server, 1);
        break;

    default: // TODO: RTU
        return 1;
    }

    db = modbus_mapping_new(
        opt.nb_bits,
        opt.nb_wbits,
        opt.nb_regs,
        opt.nb_wregs);

    std::cout << "Setup complete" << std::endl;

    while (1)
    {
        int client_sock = -1;
        modbus_t *client = NULL;
        pthread_t thread = NULL;

        switch (opt.type)
        {
        case TCP:
            client_sock = modbus_tcp_accept(server, &sock);
            client = modbus_new_tcp(NULL, atoi(opt.port));
            break;

        case TCP_PI:
            client_sock = modbus_tcp_pi_accept(server, &sock);
            client = modbus_new_tcp_pi(NULL, opt.port);
            break;

        default:
            std::cerr << "Wrong modbus communicaiton type (RTU not implemented)" << std::endl;
        }

        status = modbus_set_socket(client, client_sock);

        if (status == -1)
        {
            std::cerr << "Something went wrong. Error code: " << errno << "Error: " << modbus_strerror(errno) << std::endl;
        }

        pthread_create(&thread, NULL, &HandleConnection, client);
        pthread_detach(thread); // I hope the thread still gets stopped when main() exits...
    }
}