use strict;
use warnings;



my $config_file;
if (scalar(@ARGV) > 0) {
	$config_file  = shift @ARGV;
} else {
	$config_file = 'config'
}

print "$config_file";


open(CONFIG,'<',$config_file);


my %config_value_hash;
#putting in default values

my @needed_configs = qw/MINESWEEPERPORT WEBSOCKETPORT WEBSERVERPORT/;
while (<CONFIG>) {
	chomp;
	/(.+?):(.+)/;
	$config_value_hash{$1} = $2;
}

#checking the configs are here
for (@needed_configs) {
	die "config value $_ missing\n" if not defined($config_value_hash{$_});
}

#forking to launch the server
my $pid = fork();
if ($pid == 0) {
	my $websocketport = $config_value_hash{'WEBSOCKETPORT'};
	my $minesweeperport = $config_value_hash{'MINESWEEPERPORT'};
	print STDERR "launching websocket server on port $websocketport\n";
	exec("node ./server/proxyServer.js $websocketport $minesweeperport");
}

#launching the client
my $clientport = $config_value_hash{'WEBSERVERPORT'};
print STDERR "launching the client server on port $clientport\n";
print STDERR "gui will be available at http://localhost:$clientport/client/client.html\n";
exec("python -m SimpleHTTPServer $clientport");


