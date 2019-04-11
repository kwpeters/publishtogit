"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var yargs = require("yargs");
var directory_1 = require("./depot/directory");
var publishToDir_1 = require("./publishToDir");
// Each command is implemented in its own module.
yargs
    .command({
    command: "dir <packageDir> <publishDir>",
    describe: "Publish to a directory",
    builder: function builder(argv) {
        return argv
            .positional("packageDir", {
            describe: "The directory containing the package to be published",
            type: "string"
        })
            .positional("publishDir", {
            describe: "The directory to publish to",
            type: "string"
        });
    },
    handler: function handler(args) {
        publishToDir_1.publishToDir(new directory_1.Directory(args.packageDir), new directory_1.Directory(args.publishDir))
            .then(function () {
            process.exit(0);
        });
    }
})
    .wrap(yargs.terminalWidth())
    .help().argv; // tslint:disable-line:no-unused-expression

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wdWJsaXNodG8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBK0I7QUFDL0IsK0NBQTRDO0FBQzVDLCtDQUE0QztBQUc1QyxpREFBaUQ7QUFDakQsS0FBSztLQUNKLE9BQU8sQ0FBQztJQUNMLE9BQU8sRUFBRSwrQkFBK0I7SUFDeEMsUUFBUSxFQUFFLHdCQUF3QjtJQUNsQyxPQUFPLEVBQUUsaUJBQWlCLElBQWdCO1FBQ3RDLE9BQU8sSUFBSTthQUNWLFVBQVUsQ0FBQyxZQUFZLEVBQUU7WUFDdEIsUUFBUSxFQUFFLHNEQUFzRDtZQUNoRSxJQUFJLEVBQUUsUUFBUTtTQUNqQixDQUFDO2FBQ0QsVUFBVSxDQUFDLFlBQVksRUFBRTtZQUN0QixRQUFRLEVBQUUsNkJBQTZCO1lBQ3ZDLElBQUksRUFBRSxRQUFRO1NBQ2pCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDRCxPQUFPLEVBQUUsaUJBQWlCLElBQXFCO1FBQzNDLDJCQUFZLENBQUMsSUFBSSxxQkFBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLHFCQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQzNFLElBQUksQ0FBQztZQUNGLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0osQ0FBQztLQUNELElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7S0FDM0IsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUksMkNBQTJDIiwiZmlsZSI6InB1Ymxpc2h0by5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHlhcmdzIGZyb20gXCJ5YXJnc1wiO1xuaW1wb3J0IHtEaXJlY3Rvcnl9IGZyb20gXCIuL2RlcG90L2RpcmVjdG9yeVwiO1xuaW1wb3J0IHtwdWJsaXNoVG9EaXJ9IGZyb20gXCIuL3B1Ymxpc2hUb0RpclwiO1xuXG5cbi8vIEVhY2ggY29tbWFuZCBpcyBpbXBsZW1lbnRlZCBpbiBpdHMgb3duIG1vZHVsZS5cbnlhcmdzXG4uY29tbWFuZCh7XG4gICAgY29tbWFuZDogXCJkaXIgPHBhY2thZ2VEaXI+IDxwdWJsaXNoRGlyPlwiLFxuICAgIGRlc2NyaWJlOiBcIlB1Ymxpc2ggdG8gYSBkaXJlY3RvcnlcIixcbiAgICBidWlsZGVyOiBmdW5jdGlvbiBidWlsZGVyKGFyZ3Y6IHlhcmdzLkFyZ3YpOiB5YXJncy5Bcmd2IHtcbiAgICAgICAgcmV0dXJuIGFyZ3ZcbiAgICAgICAgLnBvc2l0aW9uYWwoXCJwYWNrYWdlRGlyXCIsIHtcbiAgICAgICAgICAgIGRlc2NyaWJlOiBcIlRoZSBkaXJlY3RvcnkgY29udGFpbmluZyB0aGUgcGFja2FnZSB0byBiZSBwdWJsaXNoZWRcIixcbiAgICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICAgICAgfSlcbiAgICAgICAgLnBvc2l0aW9uYWwoXCJwdWJsaXNoRGlyXCIsIHtcbiAgICAgICAgICAgIGRlc2NyaWJlOiBcIlRoZSBkaXJlY3RvcnkgdG8gcHVibGlzaCB0b1wiLFxuICAgICAgICAgICAgdHlwZTogXCJzdHJpbmdcIlxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGhhbmRsZXI6IGZ1bmN0aW9uIGhhbmRsZXIoYXJnczogeWFyZ3MuQXJndW1lbnRzKTogdm9pZCB7XG4gICAgICAgIHB1Ymxpc2hUb0RpcihuZXcgRGlyZWN0b3J5KGFyZ3MucGFja2FnZURpciksIG5ldyBEaXJlY3RvcnkoYXJncy5wdWJsaXNoRGlyKSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDApO1xuICAgICAgICB9KTtcbiAgICB9XG59KVxuLndyYXAoeWFyZ3MudGVybWluYWxXaWR0aCgpKVxuLmhlbHAoKS5hcmd2OyAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1saW5lOm5vLXVudXNlZC1leHByZXNzaW9uXG4iXX0=
